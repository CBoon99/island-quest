import type { PowerUpId } from '@/types';

export type PowerUpDefinition = {
  id: PowerUpId;
  name: string;
  description: string;
  maxPerRound: number;
  timing: 'before-answer' | 'on-wrong' | 'either';
};

export const POWER_UPS: PowerUpDefinition[] = [
  {
    id: 'fifty-fifty',
    name: 'Fifty-Fifty',
    description: 'Hide two wrong answers.',
    maxPerRound: 1,
    timing: 'before-answer',
  },
  {
    id: 'extra-time',
    name: 'Extra Time',
    description: 'Add 10 seconds on this question.',
    maxPerRound: 1,
    timing: 'before-answer',
  },
  {
    id: 'ask-guide',
    name: 'Ask the Guide',
    description: 'Get a treasure tip without losing a turn.',
    maxPerRound: 1,
    timing: 'before-answer',
  },
  {
    id: 'double-treasure',
    name: 'Double Treasure',
    description: 'Double points if you hit this one.',
    maxPerRound: 1,
    timing: 'before-answer',
  },
  {
    id: 'second-chance',
    name: 'Second Chance',
    description: 'Try again once if you miss.',
    maxPerRound: 1,
    timing: 'on-wrong',
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'Protect your streak if you miss.',
    maxPerRound: 1,
    timing: 'either',
  },
];

export function getPowerUp(id: PowerUpId): PowerUpDefinition | undefined {
  return POWER_UPS.find((p) => p.id === id);
}
