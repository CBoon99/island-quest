import { describe, expect, it } from 'vitest';
import {
  BASE_POINTS,
  clampResponseTimeMs,
  levelFromXp,
  scoreRound,
  streakBonusForRoundStreak,
} from '@/lib/scoring';
import type { AttemptInput, Player, Question, Round } from '@/types';

const player: Player = {
  id: 'pl_test',
  displayName: 'Test',
  ageBand: '8-9',
  difficultyLevel: 2,
  avatarId: 'a',
  guideCharacterId: 'captain-coral',
  xp: 0,
  level: 1,
  coins: 0,
  currentStreak: 0,
  longestStreak: 0,
  enabled: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function q(id: string, difficulty: 1 | 2 | 3 | 4 = 1): Question {
  return {
    id,
    status: 'active',
    type: 'multiple-choice',
    category: 'General Knowledge',
    worldId: 'pirate-bay',
    difficulty,
    question: `Q ${id}?`,
    answers: [
      { id: `${id}_a`, text: 'A' },
      { id: `${id}_b`, text: 'B' },
      { id: `${id}_c`, text: 'C' },
      { id: `${id}_d`, text: 'D' },
    ],
    correctAnswerId: `${id}_a`,
    explanation: 'Because.',
    tags: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    sourceName: 'test',
  };
}

function round(ids: string[], mode: Round['mode'] = 'quick-play'): Round {
  return {
    id: 'rnd_1',
    playerId: player.id,
    mode,
    weekId: '2026-W31',
    difficultyLevel: 2,
    questionIds: ids,
    powerUpsGranted: [
      'fifty-fifty',
      'extra-time',
      'double-treasure',
      'second-chance',
      'shield',
    ],
    powerUpsRemaining: {
      'fifty-fifty': 1,
      'extra-time': 1,
      'double-treasure': 1,
      'second-chance': 1,
      shield: 1,
    },
    status: 'started',
    startedAt: '2026-07-30T00:00:00.000Z',
    expiresAt: '2026-07-30T04:00:00.000Z',
  };
}

describe('scoring pure helpers', () => {
  it('clamps response time', () => {
    expect(clampResponseTimeMs(-5)).toBe(0);
    expect(clampResponseTimeMs(200_000)).toBe(120_000);
    expect(clampResponseTimeMs(1500)).toBe(1500);
  });

  it('computes level from xp', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(499)).toBe(1);
    expect(levelFromXp(500)).toBe(2);
  });

  it('streak bonus within round', () => {
    expect(streakBonusForRoundStreak(1)).toBe(0);
    expect(streakBonusForRoundStreak(2)).toBe(25);
    expect(streakBonusForRoundStreak(5)).toBe(100);
    expect(streakBonusForRoundStreak(10)).toBe(100);
  });
});

describe('scoreRound', () => {
  it('scores a perfect quick play with first-of-day and perfect bonus', () => {
    const ids = ['q1', 'q2', 'q3'];
    const questions = new Map(ids.map((id) => [id, q(id, 1)]));
    const attempts: AttemptInput[] = ids.map((id) => ({
      questionId: id,
      selectedAnswerId: `${id}_a`,
      responseTimeMs: 1000,
      powerUpsUsed: [],
    }));
    const res = scoreRound(round(ids), questions, attempts, player, {
      weekId: '2026-W31',
      isFirstCompletedRoundOfLocalDay: true,
      now: new Date('2026-07-30T01:00:00.000Z'),
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.result.correctCount).toBe(3);
    expect(res.result.bonuses.firstRoundOfDay).toBe(100);
    expect(res.result.bonuses.perfectRound).toBe(300);
    // base 100*3 + speed + streak + bonuses
    expect(res.result.score).toBeGreaterThan(100 * 3 + 100 + 300);
    expect(res.result.xpEarned).toBe(3 * 10 + 50);
  });

  it('uses question difficulty for base points not player level', () => {
    const ids = ['qh'];
    const questions = new Map([['qh', q('qh', 4)]]);
    const attempts: AttemptInput[] = [
      {
        questionId: 'qh',
        selectedAnswerId: 'qh_a',
        responseTimeMs: 5000,
        powerUpsUsed: [],
      },
    ];
    const res = scoreRound(round(ids), questions, attempts, player, {
      weekId: '2026-W31',
      isFirstCompletedRoundOfLocalDay: false,
      now: new Date('2026-07-30T01:00:00.000Z'),
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.result.attempts[0].basePoints).toBe(BASE_POINTS[4]);
  });

  it('double treasure multiplies points', () => {
    const ids = ['qd'];
    const questions = new Map([['qd', q('qd', 1)]]);
    const attempts: AttemptInput[] = [
      {
        questionId: 'qd',
        selectedAnswerId: 'qd_a',
        responseTimeMs: 1000,
        powerUpsUsed: ['double-treasure'],
      },
    ];
    const res = scoreRound(round(ids), questions, attempts, player, {
      weekId: '2026-W31',
      isFirstCompletedRoundOfLocalDay: false,
      now: new Date('2026-07-30T01:00:00.000Z'),
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.result.attempts[0].powerUpMultiplier).toBe(2);
    expect(res.result.attempts[0].pointsAwarded).toBe(
      (res.result.attempts[0].basePoints +
        res.result.attempts[0].speedBonus +
        res.result.attempts[0].streakBonus) *
        2,
    );
  });

  it('second chance recovery awards base without speed bonus', () => {
    const ids = ['qs'];
    const questions = new Map([['qs', q('qs', 1)]]);
    const attempts: AttemptInput[] = [
      {
        questionId: 'qs',
        selectedAnswerId: 'qs_b',
        responseTimeMs: 500,
        powerUpsUsed: ['second-chance'],
        secondChanceSelectedAnswerId: 'qs_a',
      },
    ];
    const res = scoreRound(round(ids), questions, attempts, player, {
      weekId: '2026-W31',
      isFirstCompletedRoundOfLocalDay: false,
      now: new Date('2026-07-30T01:00:00.000Z'),
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.result.attempts[0].correct).toBe(true);
    expect(res.result.attempts[0].speedBonus).toBe(0);
    expect(res.result.attempts[0].basePoints).toBe(100);
  });

  it('shield preserves lifetime streak with zero points', () => {
    const p = { ...player, currentStreak: 4 };
    const ids = ['qw'];
    const questions = new Map([['qw', q('qw', 1)]]);
    const attempts: AttemptInput[] = [
      {
        questionId: 'qw',
        selectedAnswerId: 'qw_b',
        responseTimeMs: 1000,
        powerUpsUsed: ['shield'],
      },
    ];
    const res = scoreRound(round(ids), questions, attempts, p, {
      weekId: '2026-W31',
      isFirstCompletedRoundOfLocalDay: false,
      now: new Date('2026-07-30T01:00:00.000Z'),
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.result.attempts[0].pointsAwarded).toBe(0);
    expect(res.playerPatch.currentStreak).toBe(4);
  });

  it('incorrect without shield breaks streak', () => {
    const p = { ...player, currentStreak: 3 };
    const ids = ['qw2'];
    const questions = new Map([['qw2', q('qw2', 1)]]);
    const attempts: AttemptInput[] = [
      {
        questionId: 'qw2',
        selectedAnswerId: 'qw2_b',
        responseTimeMs: 1000,
        powerUpsUsed: [],
      },
    ];
    const res = scoreRound(round(ids), questions, attempts, p, {
      weekId: '2026-W31',
      isFirstCompletedRoundOfLocalDay: false,
      now: new Date('2026-07-30T01:00:00.000Z'),
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.playerPatch.currentStreak).toBe(0);
  });

  it('rejects power-up overuse', () => {
    const ids = ['q1', 'q2'];
    const questions = new Map(ids.map((id) => [id, q(id)]));
    const attempts: AttemptInput[] = ids.map((id) => ({
      questionId: id,
      selectedAnswerId: `${id}_a`,
      responseTimeMs: 1000,
      powerUpsUsed: ['double-treasure'],
    }));
    const res = scoreRound(round(ids), questions, attempts, player, {
      weekId: '2026-W31',
      isFirstCompletedRoundOfLocalDay: false,
      now: new Date('2026-07-30T01:00:00.000Z'),
    });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('POWERUP_OVERUSE');
  });

  it('rejects wrong order / count', () => {
    const ids = ['q1', 'q2'];
    const questions = new Map(ids.map((id) => [id, q(id)]));
    const attempts: AttemptInput[] = [
      {
        questionId: 'q2',
        selectedAnswerId: 'q2_a',
        responseTimeMs: 1,
        powerUpsUsed: [],
      },
      {
        questionId: 'q1',
        selectedAnswerId: 'q1_a',
        responseTimeMs: 1,
        powerUpsUsed: [],
      },
    ];
    const res = scoreRound(round(ids), questions, attempts, player, {
      weekId: '2026-W31',
      isFirstCompletedRoundOfLocalDay: false,
      now: new Date('2026-07-30T01:00:00.000Z'),
    });
    expect(res.ok).toBe(false);
  });

  it('daily challenge bonus when at least one correct', () => {
    const ids = ['q1'];
    const questions = new Map([['q1', q('q1')]]);
    const attempts: AttemptInput[] = [
      {
        questionId: 'q1',
        selectedAnswerId: 'q1_a',
        responseTimeMs: 2000,
        powerUpsUsed: [],
      },
    ];
    const res = scoreRound(round(ids, 'daily-challenge'), questions, attempts, player, {
      weekId: '2026-W31',
      isFirstCompletedRoundOfLocalDay: false,
      now: new Date('2026-07-30T01:00:00.000Z'),
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.result.bonuses.dailyChallenge).toBe(250);
  });

  it('ignores client fantasy — only server math (adversarial totals not in inputs)', () => {
    // scoreRound has no score parameter — compile-time guarantee; runtime check:
    const ids = ['q1'];
    const questions = new Map([['q1', q('q1')]]);
    const attempts: AttemptInput[] = [
      {
        questionId: 'q1',
        selectedAnswerId: 'q1_a',
        responseTimeMs: 3000,
        powerUpsUsed: [],
      },
    ];
    const res = scoreRound(round(ids), questions, attempts, player, {
      weekId: '2026-W31',
      isFirstCompletedRoundOfLocalDay: false,
      now: new Date('2026-07-30T01:00:00.000Z'),
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.result.score).toBeLessThan(999999);
  });
});
