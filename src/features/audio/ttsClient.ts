/**
 * Client TTS — fail-open. Never throws for play; returns soft status.
 */

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const MEMORY_CACHE = new Map<string, string>();
const SESSION_INDEX_KEY = 'iq_tts_cache_index';
const MAX_SESSION_ENTRIES = 24;

export type TtsStatus = 'ok' | 'unavailable' | 'muted' | 'error';

export type TtsResult = {
  status: TtsStatus;
  message?: string;
};

let currentAudio: HTMLAudioElement | null = null;
let objectUrl: string | null = null;

function cacheKey(text: string, characterId: string): string {
  return `${characterId}::${text}`;
}

function readSessionIndex(): string[] {
  try {
    const raw = sessionStorage.getItem(SESSION_INDEX_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeSessionIndex(keys: string[]): void {
  try {
    sessionStorage.setItem(SESSION_INDEX_KEY, JSON.stringify(keys.slice(-MAX_SESSION_ENTRIES)));
  } catch {
    /* quota — ignore */
  }
}

function getCachedAudioDataUrl(text: string, characterId: string): string | null {
  const key = cacheKey(text, characterId);
  if (MEMORY_CACHE.has(key)) return MEMORY_CACHE.get(key)!;
  try {
    const raw = sessionStorage.getItem(`iq_tts:${key}`);
    if (raw) {
      MEMORY_CACHE.set(key, raw);
      return raw;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function setCachedAudioDataUrl(
  text: string,
  characterId: string,
  dataUrl: string,
): void {
  const key = cacheKey(text, characterId);
  MEMORY_CACHE.set(key, dataUrl);
  try {
    sessionStorage.setItem(`iq_tts:${key}`, dataUrl);
    const index = readSessionIndex().filter((k) => k !== key);
    index.push(key);
    // Evict oldest beyond cap
    while (index.length > MAX_SESSION_ENTRIES) {
      const drop = index.shift();
      if (drop) sessionStorage.removeItem(`iq_tts:${drop}`);
    }
    writeSessionIndex(index);
  } catch {
    /* ignore */
  }
}

export function stopTts(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
}

export function isVoiceEnabled(prefs: {
  masterSound: boolean;
  voice: boolean;
}): boolean {
  return prefs.masterSound && prefs.voice;
}

/**
 * Request TTS audio and play. Fail-open: never blocks gameplay.
 */
export async function speakText(input: {
  text: string;
  characterId: string;
  enabled: boolean;
  fetchImpl?: typeof fetch;
}): Promise<TtsResult> {
  if (!input.enabled) {
    return { status: 'muted' };
  }
  const text = input.text.trim();
  if (!text || !input.characterId) {
    return { status: 'unavailable', message: 'Voice unavailable' };
  }

  stopTts();

  const cached = getCachedAudioDataUrl(text, input.characterId);
  if (cached) {
    return playDataUrl(cached);
  }

  const fetchFn = input.fetchImpl ?? fetch;
  try {
    const res = await fetchFn(`${API_BASE}/text-to-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, characterId: input.characterId }),
    });

    if (!res.ok) {
      return { status: 'unavailable', message: 'Voice unavailable' };
    }

    const data = (await res.json()) as {
      audioBase64?: string;
      contentType?: string;
    };
    if (!data.audioBase64) {
      return { status: 'unavailable', message: 'Voice unavailable' };
    }

    const contentType = data.contentType || 'audio/mpeg';
    const dataUrl = `data:${contentType};base64,${data.audioBase64}`;
    setCachedAudioDataUrl(text, input.characterId, dataUrl);
    return playDataUrl(dataUrl);
  } catch {
    return { status: 'error', message: 'Voice unavailable' };
  }
}

function playDataUrl(dataUrl: string): TtsResult {
  try {
    const audio = new Audio(dataUrl);
    currentAudio = audio;
    void audio.play().catch(() => {
      /* autoplay blocked — soft fail */
    });
    return { status: 'ok' };
  } catch {
    return { status: 'error', message: 'Voice unavailable' };
  }
}

/** Test helper */
export function __resetTtsCacheForTests(): void {
  MEMORY_CACHE.clear();
  stopTts();
}
