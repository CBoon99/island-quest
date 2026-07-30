/**
 * ElevenLabs TTS proxy helpers — no secrets leave this module.
 */

export const CHARACTER_VOICE_ENV: Record<string, string> = {
  'captain-coral': 'ELEVENLABS_CAPTAIN_CORAL_VOICE_ID',
  'professor-paws': 'ELEVENLABS_PROFESSOR_PAWS_VOICE_ID',
  nova: 'ELEVENLABS_NOVA_VOICE_ID',
  rex: 'ELEVENLABS_REX_VOICE_ID',
  miko: 'ELEVENLABS_MIKO_VOICE_ID',
};

export const ALLOWED_CHARACTER_IDS = Object.keys(CHARACTER_VOICE_ENV);

export type TtsRequestBody = {
  text: string;
  characterId: string;
};

export type TtsValidateOk = {
  ok: true;
  text: string;
  characterId: string;
  voiceId: string;
  maxChars: number;
};

export type TtsValidateErr = {
  ok: false;
  status: number;
  code: string;
  message: string;
};

export function getMaxChars(): number {
  const n = Number(process.env.TTS_MAX_CHARS ?? '500');
  return Number.isFinite(n) && n > 0 ? Math.min(n, 2000) : 500;
}

export function getTtsRateLimitPerMinute(): number {
  const n = Number(process.env.TTS_RATE_LIMIT_PER_MINUTE ?? '30');
  return Number.isFinite(n) && n > 0 ? n : 30;
}

export function resolveVoiceId(characterId: string): string | null {
  const envKey = CHARACTER_VOICE_ENV[characterId];
  if (!envKey) return null;
  const voiceId = process.env[envKey]?.trim();
  // Placeholder voices for local/dev when env not set but key exists —
  // still require an actual voice ID string for live ElevenLabs.
  return voiceId || null;
}

export function validateTtsBody(raw: unknown): TtsValidateOk | TtsValidateErr {
  if (!raw || typeof raw !== 'object') {
    return {
      ok: false,
      status: 400,
      code: 'INVALID_BODY',
      message: 'Expected JSON body.',
    };
  }
  const body = raw as Record<string, unknown>;
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const characterId =
    typeof body.characterId === 'string' ? body.characterId.trim() : '';

  if (!characterId || !ALLOWED_CHARACTER_IDS.includes(characterId)) {
    return {
      ok: false,
      status: 400,
      code: 'INVALID_CHARACTER',
      message: 'Character not allowed for voice.',
    };
  }

  const maxChars = getMaxChars();
  if (!text) {
    return {
      ok: false,
      status: 400,
      code: 'EMPTY_TEXT',
      message: 'Text is required.',
    };
  }
  if (text.length > maxChars) {
    return {
      ok: false,
      status: 400,
      code: 'TEXT_TOO_LONG',
      message: `Text exceeds ${maxChars} characters.`,
    };
  }

  // Reject raw voiceId from client — allowlist only via characterId
  if ('voiceId' in body && body.voiceId != null) {
    return {
      ok: false,
      status: 400,
      code: 'VOICE_ID_NOT_ALLOWED',
      message: 'Pass characterId only; voice ids are server-side.',
    };
  }

  const voiceId = resolveVoiceId(characterId);
  if (!voiceId) {
    // Soft: character known but no voice mapped — treat as service unavailable
    return {
      ok: false,
      status: 503,
      code: 'VOICE_UNCONFIGURED',
      message: 'Voice unavailable',
    };
  }

  return { ok: true, text, characterId, voiceId, maxChars };
}

export type ElevenLabsFetch = typeof fetch;

export async function synthesizeWithElevenLabs(input: {
  text: string;
  voiceId: string;
  apiKey: string;
  modelId?: string;
  fetchImpl?: ElevenLabsFetch;
}): Promise<
  | { ok: true; audioBase64: string; contentType: string }
  | { ok: false; status: number; code: string; message: string }
> {
  const fetchFn = input.fetchImpl ?? fetch;
  const modelId =
    input.modelId || process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

  try {
    const res = await fetchFn(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(input.voiceId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
          'xi-api-key': input.apiKey,
        },
        body: JSON.stringify({
          text: input.text,
          model_id: modelId,
        }),
      },
    );

    if (!res.ok) {
      // Never echo provider body (may leak details)
      return {
        ok: false,
        status: 503,
        code: 'TTS_PROVIDER_ERROR',
        message: 'Voice unavailable',
      };
    }

    const buf = Buffer.from(await res.arrayBuffer());
    return {
      ok: true,
      audioBase64: buf.toString('base64'),
      contentType: res.headers.get('content-type') || 'audio/mpeg',
    };
  } catch {
    return {
      ok: false,
      status: 503,
      code: 'TTS_NETWORK',
      message: 'Voice unavailable',
    };
  }
}
