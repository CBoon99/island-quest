/**
 * Live ElevenLabs smoke for all 5 Island Quest characters.
 * Requires .env with ELEVENLABS_API_KEY + voice IDs. Does not print secrets.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    )
      v = v.slice(1, -1);
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnv(resolve(root, '.env'));

const map = {
  'captain-coral': {
    env: 'ELEVENLABS_CAPTAIN_CORAL_VOICE_ID',
    text: 'Ready to dive into your next adventure?',
  },
  'professor-paws': {
    env: 'ELEVENLABS_PROFESSOR_PAWS_VOICE_ID',
    text: 'Curious minds find the best treasure.',
  },
  nova: {
    env: 'ELEVENLABS_NOVA_VOICE_ID',
    text: 'Blast off — facts wait among the stars!',
  },
  rex: {
    env: 'ELEVENLABS_REX_VOICE_ID',
    text: 'Roar! Let’s stomp into a quest!',
  },
  miko: {
    env: 'ELEVENLABS_MIKO_VOICE_ID',
    text: 'Home waters call — adventure awaits!',
  },
};

const key = process.env.ELEVENLABS_API_KEY?.trim();
if (!key) {
  console.error('FAIL: ELEVENLABS_API_KEY missing');
  process.exit(1);
}

const model = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const outDir = resolve(root, '.data/tts-smoke');
mkdirSync(outDir, { recursive: true });

let failed = 0;
for (const [id, cfg] of Object.entries(map)) {
  const voiceId = process.env[cfg.env]?.trim();
  if (!voiceId) {
    console.error(`FAIL ${id}: voice id unset (${cfg.env})`);
    failed += 1;
    continue;
  }
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
        'xi-api-key': key,
      },
      body: JSON.stringify({ text: cfg.text, model_id: model }),
    },
  );
  if (!res.ok) {
    console.error(`FAIL ${id}: HTTP ${res.status}`);
    failed += 1;
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const file = resolve(outDir, `${id}.mp3`);
  writeFileSync(file, buf);
  console.log(`OK ${id} voice=${voiceId.slice(0, 6)}… bytes=${buf.length} → ${file}`);
}

if (failed) {
  console.error(`tts:smoke failed ${failed} character(s)`);
  process.exit(1);
}
console.log('tts:smoke PASS (5/5)');
