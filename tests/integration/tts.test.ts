import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handler } from '../../netlify/functions/text-to-speech';
import {
  ALLOWED_CHARACTER_IDS,
  validateTtsBody,
  synthesizeWithElevenLabs,
} from '../../netlify/functions/_shared/tts';
import { resetAllRateLimits } from '../../netlify/functions/_shared/rateLimit';

describe('TTS validateTtsBody', () => {
  const prev = { ...process.env };

  beforeEach(() => {
    process.env.ELEVENLABS_CAPTAIN_CORAL_VOICE_ID = 'voice_captain';
    process.env.TTS_MAX_CHARS = '100';
  });

  afterEach(() => {
    process.env = { ...prev };
  });

  it('accepts allowlisted character + short text', () => {
    const r = validateTtsBody({
      text: 'Hello island!',
      characterId: 'captain-coral',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.voiceId).toBe('voice_captain');
      expect(ALLOWED_CHARACTER_IDS).toContain(r.characterId);
    }
  });

  it('rejects unknown character', () => {
    const r = validateTtsBody({ text: 'Hi', characterId: 'evil-bot' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('INVALID_CHARACTER');
  });

  it('rejects client-supplied voiceId', () => {
    const r = validateTtsBody({
      text: 'Hi',
      characterId: 'captain-coral',
      voiceId: 'attacker',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('VOICE_ID_NOT_ALLOWED');
  });

  it('rejects over-long text', () => {
    const r = validateTtsBody({
      text: 'x'.repeat(101),
      characterId: 'captain-coral',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('TEXT_TOO_LONG');
  });
});

describe('synthesizeWithElevenLabs', () => {
  it('returns audio on success', async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { 'Content-Type': 'audio/mpeg' },
      });
    }) as unknown as typeof fetch;

    const r = await synthesizeWithElevenLabs({
      text: 'Hi',
      voiceId: 'v1',
      apiKey: 'secret-key-must-not-leak',
      fetchImpl,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.audioBase64).toBe(Buffer.from([1, 2, 3]).toString('base64'));
    }
    const call = fetchImpl.mock.calls[0];
    const headers = call[1]?.headers as Record<string, string>;
    expect(headers['xi-api-key']).toBe('secret-key-must-not-leak');
    // Response body never includes the key
  });

  it('soft-fails on provider error without leaking details', async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(JSON.stringify({ detail: 'api key invalid xyz' }), {
        status: 401,
      });
    }) as unknown as typeof fetch;

    const r = await synthesizeWithElevenLabs({
      text: 'Hi',
      voiceId: 'v1',
      apiKey: 'bad',
      fetchImpl,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.message).toBe('Voice unavailable');
      expect(JSON.stringify(r)).not.toContain('xyz');
      expect(JSON.stringify(r)).not.toContain('api key');
    }
  });
});

describe('text-to-speech handler', () => {
  const prev = { ...process.env };

  beforeEach(() => {
    resetAllRateLimits();
    process.env.ELEVENLABS_API_KEY = 'test-key';
    process.env.ELEVENLABS_CAPTAIN_CORAL_VOICE_ID = 'voice_captain';
    process.env.TTS_RATE_LIMIT_PER_MINUTE = '30';
  });

  afterEach(() => {
    process.env = { ...prev };
    vi.unstubAllGlobals();
  });

  it('returns 503 when API key missing (graceful degrade)', async () => {
    delete process.env.ELEVENLABS_API_KEY;
    const res = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ text: 'Hi', characterId: 'captain-coral' }),
      queryStringParameters: null,
      headers: {},
    });
    expect(res.statusCode).toBe(503);
    const body = JSON.parse(res.body) as { error: { message: string; code: string } };
    expect(body.error.message).toBe('Voice unavailable');
    expect(res.body).not.toContain('test-key');
    expect(res.body).not.toContain('xi-api-key');
  });

  it('returns audio payload on success (mocked fetch)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(new Uint8Array([9, 9]), {
          status: 200,
          headers: { 'Content-Type': 'audio/mpeg' },
        });
      }),
    );

    const res = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ text: 'Adventure awaits', characterId: 'captain-coral' }),
      queryStringParameters: null,
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as {
      audioBase64: string;
      characterId: string;
    };
    expect(body.characterId).toBe('captain-coral');
    expect(body.audioBase64).toBeTruthy();
    expect(res.body).not.toContain('test-key');
  });

  it('returns 503 soft fail when ElevenLabs errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 500 })),
    );

    const res = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ text: 'Hi', characterId: 'captain-coral' }),
      queryStringParameters: null,
      headers: { 'x-forwarded-for': '9.9.9.9' },
    });
    expect(res.statusCode).toBe(503);
    const body = JSON.parse(res.body) as { error: { message: string } };
    expect(body.error.message).toBe('Voice unavailable');
  });
});
