import type { AttemptInput, CompletedRoundResult } from '@/types';

const PENDING_KEY = 'iq_pending_completions';
const ACTIVE_PLAYER_KEY = 'iq_active_player';
const PREFS_KEY = 'iq_prefs';

export type PendingCompletion = {
  roundId: string;
  playerId: string;
  attempts: AttemptInput[];
  clientCompletedAt: string;
  queuedAt: string;
};

export type ClientPrefs = {
  masterSound: boolean;
  music: boolean;
  effects: boolean;
  voice: boolean;
  comicFart: boolean;
  reducedMotion: boolean;
};

const DEFAULT_PREFS: ClientPrefs = {
  masterSound: true,
  music: false,
  effects: true,
  voice: true,
  comicFart: true,
  reducedMotion: false,
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getActivePlayerId(): string | null {
  return localStorage.getItem(ACTIVE_PLAYER_KEY);
}

export function setActivePlayerId(id: string): void {
  localStorage.setItem(ACTIVE_PLAYER_KEY, id);
}

export function getPrefs(): ClientPrefs {
  return { ...DEFAULT_PREFS, ...readJson(PREFS_KEY, {}) };
}

export function setPrefs(patch: Partial<ClientPrefs>): ClientPrefs {
  const next = { ...getPrefs(), ...patch };
  localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  return next;
}

export function getPendingCompletions(): PendingCompletion[] {
  return readJson<PendingCompletion[]>(PENDING_KEY, []);
}

export function enqueuePendingCompletion(item: PendingCompletion): void {
  const list = getPendingCompletions().filter((p) => p.roundId !== item.roundId);
  list.push(item);
  localStorage.setItem(PENDING_KEY, JSON.stringify(list));
}

export function removePendingCompletion(roundId: string): void {
  const list = getPendingCompletions().filter((p) => p.roundId !== roundId);
  localStorage.setItem(PENDING_KEY, JSON.stringify(list));
}

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'pending' | 'error';

export type LocalResultsCache = {
  result: CompletedRoundResult;
  verified: boolean;
  syncStatus: SyncStatus;
};

const RESULTS_KEY = 'iq_last_results';

export function cacheLocalResults(payload: LocalResultsCache): void {
  sessionStorage.setItem(RESULTS_KEY, JSON.stringify(payload));
}

export function getCachedLocalResults(): LocalResultsCache | null {
  try {
    const raw = sessionStorage.getItem(RESULTS_KEY);
    return raw ? (JSON.parse(raw) as LocalResultsCache) : null;
  } catch {
    return null;
  }
}
