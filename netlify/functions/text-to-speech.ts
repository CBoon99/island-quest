import {
  clientKey,
  consumeRateLimit,
} from './_shared/rateLimit';
import {
  getTtsRateLimitPerMinute,
  synthesizeWithElevenLabs,
  validateTtsBody,
} from './_shared/tts';
import { errorResponse, json, requestId, type Handler } from './_shared/http';

export const handler: Handler = async (event) => {
  const rid = requestId();
  if (event.httpMethod !== 'POST') {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', 'POST only.', rid);
  }

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    return errorResponse(503, 'TTS_UNAVAILABLE', 'Voice unavailable', rid);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(event.body || '{}');
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'Invalid JSON body.', rid);
  }

  const validated = validateTtsBody(raw);
  if (!validated.ok) {
    return errorResponse(validated.status, validated.code, validated.message, rid);
  }

  const ip = clientKey({
    headers: (event as { headers?: Record<string, string | undefined> }).headers,
  });
  const limit = getTtsRateLimitPerMinute();
  const rl = consumeRateLimit(`tts:${ip}`, limit, 60_000);
  if (!rl.allowed) {
    return errorResponse(
      429,
      'RATE_LIMITED',
      'Too many voice requests. Try again shortly.',
      rid,
    );
  }

  const synth = await synthesizeWithElevenLabs({
    text: validated.text,
    voiceId: validated.voiceId,
    apiKey,
  });

  if (!synth.ok) {
    return errorResponse(synth.status, synth.code, synth.message, rid);
  }

  return json(200, {
    audioBase64: synth.audioBase64,
    contentType: synth.contentType,
    characterId: validated.characterId,
    requestId: rid,
  });
};

export default { handler };
