import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __resetTtsCacheForTests,
  speakText,
  stopTts,
} from '@/features/audio/ttsClient';

describe('ttsClient fail-open', () => {
  beforeEach(() => {
    __resetTtsCacheForTests();
    vi.stubGlobal(
      'Audio',
      class {
        src = '';
        pause() {}
        play() {
          return Promise.resolve();
        }
      },
    );
  });

  afterEach(() => {
    stopTts();
    __resetTtsCacheForTests();
    vi.unstubAllGlobals();
  });

  it('returns muted when disabled', async () => {
    const r = await speakText({
      text: 'Hi',
      characterId: 'captain-coral',
      enabled: false,
    });
    expect(r.status).toBe('muted');
  });

  it('returns Voice unavailable on network/HTTP failure', async () => {
    const fetchImpl = vi.fn(async () => new Response('no', { status: 503 }));
    const r = await speakText({
      text: 'Ready to dive?',
      characterId: 'captain-coral',
      enabled: true,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(r.status).toBe('unavailable');
    expect(r.message).toBe('Voice unavailable');
  });

  it('plays on success and caches by text+voice', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        audioBase64: Buffer.from('abc').toString('base64'),
        contentType: 'audio/mpeg',
      }),
    );

    const r1 = await speakText({
      text: 'Hello reef',
      characterId: 'nova',
      enabled: true,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(r1.status).toBe('ok');
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const r2 = await speakText({
      text: 'Hello reef',
      characterId: 'nova',
      enabled: true,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(r2.status).toBe('ok');
    // second call served from cache
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
