import type {
  Attempt,
  AttemptInput,
  CompletedRoundResult,
  DifficultyLevel,
  Player,
  PowerUpId,
  Question,
  Round,
  WeeklyLeaderboardEntry,
} from '@/types';

export const BASE_POINTS: Record<DifficultyLevel, number> = {
  1: 100,
  2: 125,
  3: 150,
  4: 200,
};

export const SPEED_BONUS_MAX = 50;
export const STREAK_STEP = 25;
export const STREAK_BONUS_MAX = 100;

export const FIRST_ROUND_OF_DAY = 100;
export const DAILY_CHALLENGE_COMPLETE = 250;
export const PERFECT_ROUND = 300;
export const REMATCH_RECOVERY = 50;

export const DEFAULT_TIME_LIMIT_MS: Record<DifficultyLevel, number> = {
  1: 30_000,
  2: 25_000,
  3: 20_000,
  4: 18_000,
};

export const POWER_UP_MAX_PER_ROUND: Record<PowerUpId, number> = {
  'fifty-fifty': 1,
  'extra-time': 1,
  'ask-guide': 1,
  'double-treasure': 1,
  'second-chance': 1,
  shield: 1,
};

export function clampResponseTimeMs(ms: number): number {
  if (!Number.isFinite(ms) || ms < 0) return 0;
  return Math.min(ms, 120_000);
}

export function levelFromXp(xp: number): number {
  return 1 + Math.floor(Math.max(0, xp) / 500);
}

export function streakBonusForRoundStreak(consecutiveInRound: number): number {
  if (consecutiveInRound <= 1) return 0;
  return Math.min(STREAK_BONUS_MAX, STREAK_STEP * (consecutiveInRound - 1));
}

export function speedBonusMs(
  responseTimeMs: number,
  limitMs: number,
  allowSpeed: boolean,
): number {
  if (!allowSpeed || limitMs <= 0) return 0;
  const ratio = Math.max(0, 1 - responseTimeMs / limitMs);
  return Math.floor(SPEED_BONUS_MAX * ratio);
}

export type ScoreRoundContext = {
  weekId: string;
  isFirstCompletedRoundOfLocalDay: boolean;
  now: Date;
};

export type ScoreRoundError = {
  code: string;
  message: string;
};

export type ScoreRoundOk = {
  ok: true;
  result: CompletedRoundResult;
  playerPatch: {
    xp: number;
    coins: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
  };
};

export type ScoreRoundFail = {
  ok: false;
  error: ScoreRoundError;
};

/**
 * Pure server scoring — never trust client totals.
 * Client-supplied score/xp/coins/weeklyPoints must not be inputs here.
 */
export function scoreRound(
  round: Round,
  questions: Map<string, Question>,
  attempts: AttemptInput[],
  player: Player,
  context: ScoreRoundContext,
): ScoreRoundOk | ScoreRoundFail {
  if (round.status !== 'started') {
    return {
      ok: false,
      error: {
        code: 'ROUND_ALREADY_COMPLETED',
        message: 'This quest is already finished.',
      },
    };
  }

  if (round.playerId !== player.id) {
    return {
      ok: false,
      error: { code: 'PLAYER_MISMATCH', message: 'Player does not match quest.' },
    };
  }

  if (context.now.getTime() > new Date(round.expiresAt).getTime()) {
    return {
      ok: false,
      error: { code: 'ROUND_EXPIRED', message: 'This quest has expired.' },
    };
  }

  if (attempts.length !== round.questionIds.length) {
    return {
      ok: false,
      error: {
        code: 'ATTEMPT_COUNT_MISMATCH',
        message: 'Answer count does not match quest length.',
      },
    };
  }

  for (let i = 0; i < attempts.length; i++) {
    if (attempts[i].questionId !== round.questionIds[i]) {
      return {
        ok: false,
        error: {
          code: 'QUESTION_ORDER_MISMATCH',
          message: 'Answers must follow quest order.',
        },
      };
    }
  }

  const usage: Partial<Record<PowerUpId, number>> = {};
  for (const a of attempts) {
    for (const p of a.powerUpsUsed) {
      usage[p] = (usage[p] ?? 0) + 1;
    }
  }
  for (const [id, count] of Object.entries(usage) as [PowerUpId, number][]) {
    const granted =
      round.powerUpsRemaining[id] ??
      (round.powerUpsGranted.includes(id) ? POWER_UP_MAX_PER_ROUND[id] : 0);
    if (count > granted) {
      return {
        ok: false,
        error: {
          code: 'POWERUP_OVERUSE',
          message: `Too many uses of ${id}.`,
        },
      };
    }
  }

  const scoredAttempts: Attempt[] = [];
  let roundStreak = 0;
  let lifetimeStreak = player.currentStreak;
  let longest = player.longestStreak;
  let correctCount = 0;
  let sumPoints = 0;
  let bestInRoundStreak = 0;

  for (const input of attempts) {
    const q = questions.get(input.questionId);
    if (!q || q.status !== 'active') {
      return {
        ok: false,
        error: {
          code: 'INVALID_QUESTION',
          message: 'A question in this quest is not playable.',
        },
      };
    }

    const responseTimeMs = clampResponseTimeMs(input.responseTimeMs);
    const used = new Set(input.powerUpsUsed);
    const usedSecondChance = used.has('second-chance');
    const usedShield = used.has('shield');
    const usedDouble = used.has('double-treasure');
    const usedExtraTime = used.has('extra-time');

    let correct = false;
    let secondChanceRecovery = false;

    if (usedSecondChance) {
      const firstWrong =
        input.selectedAnswerId !== null &&
        input.selectedAnswerId !== q.correctAnswerId;
      const secondOk =
        input.secondChanceSelectedAnswerId === q.correctAnswerId;
      if (firstWrong && secondOk) {
        correct = true;
        secondChanceRecovery = true;
      } else if (input.selectedAnswerId === q.correctAnswerId) {
        correct = true;
      }
    } else if (input.selectedAnswerId === q.correctAnswerId) {
      correct = true;
    }

    let basePoints = 0;
    let speed = 0;
    let streakB = 0;
    let mult = 1;
    let pointsAwarded = 0;

    if (correct) {
      correctCount += 1;
      roundStreak += 1;
      bestInRoundStreak = Math.max(bestInRoundStreak, roundStreak);
      lifetimeStreak += 1;
      longest = Math.max(longest, lifetimeStreak);

      basePoints = BASE_POINTS[q.difficulty];
      const limit =
        (q.timeLimitMs ?? DEFAULT_TIME_LIMIT_MS[round.difficultyLevel]) +
        (usedExtraTime ? 10_000 : 0);
      speed = speedBonusMs(responseTimeMs, limit, !secondChanceRecovery);
      streakB = streakBonusForRoundStreak(roundStreak);
      mult = usedDouble ? 2 : 1;
      pointsAwarded = (basePoints + speed + streakB) * mult;
      sumPoints += pointsAwarded;
    } else {
      roundStreak = 0;
      if (usedShield) {
        // streak preserved; no points
      } else {
        lifetimeStreak = 0;
      }
      pointsAwarded = 0;
    }

    scoredAttempts.push({
      id: `att_${round.id}_${input.questionId}`,
      roundId: round.id,
      playerId: player.id,
      questionId: input.questionId,
      selectedAnswerId: input.selectedAnswerId,
      correct,
      responseTimeMs,
      powerUpsUsed: [...input.powerUpsUsed],
      basePoints,
      speedBonus: speed,
      streakBonus: streakB,
      powerUpMultiplier: mult,
      pointsAwarded,
      attemptedAt: context.now.toISOString(),
    });
  }

  const perfect = correctCount === attempts.length && attempts.length > 0;
  const bonuses = {
    firstRoundOfDay: context.isFirstCompletedRoundOfLocalDay ? FIRST_ROUND_OF_DAY : 0,
    dailyChallenge:
      round.mode === 'daily-challenge' && correctCount >= 1
        ? DAILY_CHALLENGE_COMPLETE
        : 0,
    perfectRound: perfect ? PERFECT_ROUND : 0,
    rematchRecovery:
      round.mode === 'rematch' && correctCount >= 1 ? REMATCH_RECOVERY : 0,
  };

  const score =
    sumPoints +
    bonuses.firstRoundOfDay +
    bonuses.dailyChallenge +
    bonuses.perfectRound +
    bonuses.rematchRecovery;

  const xpEarned =
    correctCount * 10 + (perfect ? 50 : 0) + (round.mode === 'daily-challenge' ? 25 : 0);
  const coinsEarned = correctCount * 5 + (perfect ? 20 : 0);

  const newXp = player.xp + xpEarned;
  const newCoins = player.coins + coinsEarned;
  const newLevel = levelFromXp(newXp);

  const completedRound: Round = {
    ...round,
    status: 'completed',
    completedAt: context.now.toISOString(),
    powerUpsRemaining: {},
  };

  const leaderboard: WeeklyLeaderboardEntry = {
    playerId: player.id,
    weekId: context.weekId,
    points: score,
    questsCompleted: 1,
    correctAnswers: correctCount,
    dailyChallengesCompleted: round.mode === 'daily-challenge' ? 1 : 0,
    bestStreak: Math.max(bestInRoundStreak, lifetimeStreak),
    achievementIds: [],
    updatedAt: context.now.toISOString(),
  };

  const started = new Date(round.startedAt).getTime();
  const durationMs = Math.max(0, context.now.getTime() - started);

  return {
    ok: true,
    result: {
      round: completedRound,
      attempts: scoredAttempts,
      correctCount,
      score,
      xpEarned,
      coinsEarned,
      durationMs,
      streakAfter: lifetimeStreak,
      bonuses,
      achievementsUnlocked: [],
      leaderboard,
    },
    playerPatch: {
      xp: newXp,
      coins: newCoins,
      level: newLevel,
      currentStreak: lifetimeStreak,
      longestStreak: longest,
    },
  };
}
