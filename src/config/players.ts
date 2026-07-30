import type { Player } from '../types';

const now = '2026-07-30T00:00:00.000Z';

/**
 * Island Quest players (product brief): James’s two children, ~10 and ~7.
 * Brief example uses “Aryan”; girl player is Ayla.
 */
export const SEED_PLAYERS: Player[] = [
  {
    id: 'pl_aryan',
    displayName: 'Aryan',
    ageBand: '10-11',
    difficultyLevel: 3,
    avatarId: 'avatar-explorer-1',
    guideCharacterId: 'captain-coral',
    xp: 1200,
    level: 3,
    coins: 80,
    currentStreak: 0,
    longestStreak: 5,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'pl_ayla',
    displayName: 'Ayla',
    ageBand: '6-7',
    difficultyLevel: 1,
    avatarId: 'avatar-explorer-2',
    guideCharacterId: 'miko',
    xp: 150,
    level: 1,
    coins: 25,
    currentStreak: 0,
    longestStreak: 2,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  },
];
