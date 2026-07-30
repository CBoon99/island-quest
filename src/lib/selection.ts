import type { DifficultyLevel, Player, Question, RoundMode } from '../types';

export type SelectRoundInput = {
  player: Player;
  mode: RoundMode;
  worldId?: string;
  count: number;
  now: Date;
  recentQuestionIds: string[];
  weakCategoryIds: string[];
  enabledCategories: string[];
  rngSeed: string;
  rematchMissIds?: string[];
};

export function modeQuestionCount(mode: RoundMode, availableRematch = 5): number {
  switch (mode) {
    case 'quick-play':
    case 'daily-challenge':
      return 5;
    case 'world-quest':
    case 'boss-battle':
      return 10;
    case 'rematch':
      return Math.min(5, Math.max(1, availableRematch));
    default:
      return 5;
  }
}

export function compositionForCount(
  count: number,
  level: DifficultyLevel,
): DifficultyLevel[] {
  const clamp = (n: number): DifficultyLevel =>
    Math.min(4, Math.max(1, n)) as DifficultyLevel;
  const L = level;
  const Lm = clamp(L - 1);
  const Lp = clamp(L + 1);
  if (count <= 5) {
    return [L, L, L, Lm, Lp].slice(0, count);
  }
  // 10: 5×L, 2×L-1, 2×L+1, 1×L (weak slot still L)
  return [L, L, L, L, L, Lm, Lm, Lp, Lp, L].slice(0, count);
}

/** Simple deterministic 32-bit hash */
export function hash32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickIndex(seed: string, slot: number, length: number): number {
  if (length <= 0) return 0;
  return hash32(`${seed}|${slot}`) % length;
}

export function selectQuestions(
  bank: Question[],
  input: SelectRoundInput,
): { questionIds: string[]; relaxed: boolean } {
  const active = bank.filter((q) => q.status === 'active');
  const enabled =
    input.enabledCategories.length > 0
      ? active.filter((q) => input.enabledCategories.includes(q.category))
      : active;

  let pool = enabled;
  if (input.mode === 'world-quest' && input.worldId) {
    pool = pool.filter((q) => q.worldId === input.worldId);
  }
  if (input.mode === 'rematch' && input.rematchMissIds?.length) {
    const miss = new Set(input.rematchMissIds);
    pool = pool.filter((q) => miss.has(q.id));
  }

  const recent = new Set(input.recentQuestionIds);
  let preferred = pool.filter((q) => !recent.has(q.id));
  if (preferred.length < input.count) preferred = pool;

  const targets = compositionForCount(input.count, input.player.difficultyLevel);
  const chosen: string[] = [];
  const chosenSet = new Set<string>();
  let relaxed = preferred.length < input.count;

  for (let slot = 0; slot < targets.length; slot++) {
    const diff = targets[slot];
    let slotPool = preferred.filter(
      (q) => q.difficulty === diff && !chosenSet.has(q.id),
    );
    if (slotPool.length === 0) {
      slotPool = preferred.filter((q) => !chosenSet.has(q.id));
      relaxed = true;
    }
    if (slotPool.length === 0) {
      slotPool = pool.filter((q) => !chosenSet.has(q.id));
      relaxed = true;
    }
    if (slotPool.length === 0) {
      // last resort: any active not chosen
      slotPool = active.filter((q) => !chosenSet.has(q.id));
      relaxed = true;
    }
    if (slotPool.length === 0) break;

    slotPool = [...slotPool].sort((a, b) => a.id.localeCompare(b.id));
    // Prefer weak category on last slot for 10q
    if (
      slot === targets.length - 1 &&
      input.weakCategoryIds.length > 0 &&
      input.count >= 10
    ) {
      const weak = slotPool.filter((q) =>
        input.weakCategoryIds.includes(q.category),
      );
      if (weak.length > 0) slotPool = weak;
    }

    const idx = pickIndex(input.rngSeed, slot, slotPool.length);
    const pick = slotPool[idx];
    chosen.push(pick.id);
    chosenSet.add(pick.id);
  }

  return { questionIds: chosen, relaxed };
}

export function defaultPowerUpsForMode(mode: RoundMode): import('@/types').PowerUpId[] {
  if (mode === 'boss-battle') {
    return [
      'fifty-fifty',
      'extra-time',
      'ask-guide',
      'double-treasure',
      'second-chance',
      'shield',
    ];
  }
  return ['fifty-fifty', 'extra-time', 'ask-guide', 'double-treasure'];
}
