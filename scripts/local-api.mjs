/**
 * Local API for Island Quest TTS (and health).
 * Loads .env, never logs secrets. Proxied by Vite at /api/*.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(resolve(root, '.env'));
loadEnvFile(resolve(root, '.env.local'));

const CHARACTER_VOICE_ENV = {
  'captain-coral': 'ELEVENLABS_CAPTAIN_CORAL_VOICE_ID',
  'professor-paws': 'ELEVENLABS_PROFESSOR_PAWS_VOICE_ID',
  nova: 'ELEVENLABS_NOVA_VOICE_ID',
  rex: 'ELEVENLABS_REX_VOICE_ID',
  miko: 'ELEVENLABS_MIKO_VOICE_ID',
};

const rateBuckets = new Map();

function consumeRate(key, limit, windowMs) {
  const now = Date.now();
  let b = rateBuckets.get(key);
  if (!b || now - b.start >= windowMs) {
    b = { start: now, count: 0 };
    rateBuckets.set(key, b);
  }
  b.count += 1;
  return b.count <= limit;
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(payload);
}

function errorBody(code, message, requestId) {
  return { error: { code, message, requestId } };
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
}

async function handleTts(req, res, requestId) {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    return json(res, 503, errorBody('TTS_UNAVAILABLE', 'Voice unavailable', requestId));
  }

  let raw;
  try {
    raw = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, errorBody('INVALID_JSON', 'Invalid JSON body.', requestId));
  }

  if (raw && typeof raw === 'object' && 'voiceId' in raw && raw.voiceId != null) {
    return json(
      res,
      400,
      errorBody('VOICE_ID_NOT_ALLOWED', 'Pass characterId only; voice ids are server-side.', requestId),
    );
  }

  const text = typeof raw?.text === 'string' ? raw.text.trim() : '';
  const characterId =
    typeof raw?.characterId === 'string' ? raw.characterId.trim() : '';
  const maxChars = Number(process.env.TTS_MAX_CHARS ?? '800') || 800;
  const rateLimit = Number(process.env.TTS_RATE_LIMIT_PER_MINUTE ?? '60') || 60;

  if (!characterId || !CHARACTER_VOICE_ENV[characterId]) {
    return json(
      res,
      400,
      errorBody('INVALID_CHARACTER', 'Character not allowed for voice.', requestId),
    );
  }
  if (!text) {
    return json(res, 400, errorBody('EMPTY_TEXT', 'Text is required.', requestId));
  }
  if (text.length > maxChars) {
    return json(
      res,
      400,
      errorBody('TEXT_TOO_LONG', `Text exceeds ${maxChars} characters.`, requestId),
    );
  }

  const ip =
    req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'local';
  if (!consumeRate(`tts:${ip}`, rateLimit, 60_000)) {
    return json(
      res,
      429,
      errorBody('RATE_LIMITED', 'Too many voice requests. Try again shortly.', requestId),
    );
  }

  const envKey = CHARACTER_VOICE_ENV[characterId];
  const voiceId = process.env[envKey]?.trim();
  if (!voiceId) {
    return json(res, 503, errorBody('VOICE_UNCONFIGURED', 'Voice unavailable', requestId));
  }

  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

  try {
    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({ text, model_id: modelId }),
      },
    );

    if (!elRes.ok) {
      console.error(`[tts] provider ${elRes.status} for ${characterId}`);
      return json(res, 503, errorBody('TTS_PROVIDER_ERROR', 'Voice unavailable', requestId));
    }

    const buf = Buffer.from(await elRes.arrayBuffer());
    return json(res, 200, {
      audioBase64: buf.toString('base64'),
      contentType: elRes.headers.get('content-type') || 'audio/mpeg',
      characterId,
      requestId,
    });
  } catch (e) {
    console.error('[tts] network error', e instanceof Error ? e.message : e);
    return json(res, 503, errorBody('TTS_NETWORK', 'Voice unavailable', requestId));
  }
}

function handleHealth(_req, res, requestId) {
  const hasKey = Boolean(process.env.ELEVENLABS_API_KEY?.trim());
  const voices = Object.fromEntries(
    Object.entries(CHARACTER_VOICE_ENV).map(([id, envKey]) => [
      id,
      Boolean(process.env[envKey]?.trim()),
    ]),
  );
  return json(res, 200, {
    ok: true,
    ttsConfigured: hasKey,
    voicesConfigured: voices,
    requestId,
  });
}

const port = Number(process.env.LOCAL_API_PORT || 8791);

const server = createServer(async (req, res) => {
  const requestId = `loc_${Date.now().toString(36)}`;
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    });
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
  // Accept /api/foo and /foo and /.netlify/functions/foo
  let path = url.pathname;
  if (path.startsWith('/api/')) path = path.slice(4);
  if (path.startsWith('/.netlify/functions/')) path = path.slice('/.netlify/functions'.length);

  try {
    if (path === '/health' && req.method === 'GET') {
      return handleHealth(req, res, requestId);
    }
    if (path === '/text-to-speech' && req.method === 'POST') {
      return await handleTts(req, res, requestId);
    }
    return json(res, 404, errorBody('NOT_FOUND', `No route ${path}`, requestId));
  } catch (e) {
    console.error('[api]', e);
    return json(res, 500, errorBody('INTERNAL', 'Server error', requestId));
  }
});

server.listen(port, '127.0.0.1', () => {
  const hasKey = Boolean(process.env.ELEVENLABS_API_KEY?.trim());
  const voiceCount = Object.values(CHARACTER_VOICE_ENV).filter((k) =>
    process.env[k]?.trim(),
  ).length;
  console.log(
    `[island-quest local-api] http://127.0.0.1:${port}  tts=${hasKey ? 'ready' : 'missing-key'} voices=${voiceCount}/5`,
  );
});
