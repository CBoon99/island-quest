import { describe, expect, it } from 'vitest';
import {
  compositionForCount,
  hash32,
  modeQuestionCount,
  selectQuestions,
} from '@/lib/selection';
import type { Player, Question } from '@/types';

const player: Player = {
  id: 'pl_a',
  displayName: 'A',
  ageBand: '10-11',
  difficultyLevel: 3,
  avatarId: 'a',
  guideCharacterId: 'captain-coral',
  xp: 0,
  level: 1,
  coins: 0,
  currentStreak: 0,
  longestStreak: 0,
  enabled: true,
  createdAt: '',
  updatedAt: '',
};

function makeQ(i: number, difficulty: 1 | 2 | 3 | 4, worldId = 'coral-coast'): Question {
  return {
    id: `q_${i}`,
    status: 'active',
    type: 'multiple-choice',
    category: 'Ocean',
    worldId,
    difficulty,
    question: `Question number ${i}?`,
    answers: [
      { id: `q_${i}_a`, text: 'A' },
      { id: `q_${i}_b`, text: 'B' },
      { id: `q_${i}_c`, text: 'C' },
      { id: `q_${i}_d`, text: 'D' },
    ],
    correctAnswerId: `q_${i}_a`,
    explanation: 'e',
    tags: [],
    createdAt: '',
    sourceName: 't',
  };
}

describe('selection', () => {
  it('mode counts', () => {
    expect(modeQuestionCount('quick-play')).toBe(5);
    expect(modeQuestionCount('world-quest')).toBe(10);
    expect(modeQuestionCount('rematch', 3)).toBe(3);
  });

  it('composition for L3 5q', () => {
    const c = compositionForCount(5, 3);
    expect(c).toHaveLength(5);
    expect(c.filter((d) => d === 3).length).toBeGreaterThanOrEqual(3);
  });

  it('hash deterministic', () => {
    expect(hash32('abc')).toBe(hash32('abc'));
  });

  it('selects without duplicates', () => {
    const bank: Question[] = [];
    for (let i = 0; i < 40; i++) {
      bank.push(makeQ(i, ((i % 4) + 1) as 1 | 2 | 3 | 4));
    }
    const { questionIds } = selectQuestions(bank, {
      player,
      mode: 'quick-play',
      count: 5,
      now: new Date(),
      recentQuestionIds: [],
      weakCategoryIds: [],
      enabledCategories: [],
      rngSeed: 'seed-1',
    });
    expect(questionIds).toHaveLength(5);
    expect(new Set(questionIds).size).toBe(5);
  });
});
