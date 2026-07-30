import type { WorldDefinition } from '@/types';

export const WORLDS: WorldDefinition[] = [
  {
    id: 'coral-coast',
    name: 'Coral Coast',
    description: 'Reefs, tides, and Home Waters pride.',
    theme: 'ocean',
    unlockQuestsRequired: 0,
    gradient: 'linear-gradient(145deg, #0d6e6e 0%, #1a9e9e 50%, #7dd3c7 100%)',
    icon: 'wave',
  },
  {
    id: 'jungle-trail',
    name: 'Jungle Trail',
    description: 'Vines, animals, and green mysteries.',
    theme: 'nature',
    unlockQuestsRequired: 0,
    gradient: 'linear-gradient(145deg, #1b5e20 0%, #43a047 50%, #a5d6a7 100%)',
    icon: 'leaf',
  },
  {
    id: 'star-harbor',
    name: 'Star Harbor',
    description: 'Planets, moons, and night-sky treasure.',
    theme: 'space',
    unlockQuestsRequired: 2,
    gradient: 'linear-gradient(145deg, #1a237e 0%, #5c6bc0 50%, #ce93d8 100%)',
    icon: 'star',
  },
  {
    id: 'volcano-valley',
    name: 'Volcano Valley',
    description: 'Earth science, rock facts, and heat!',
    theme: 'science',
    unlockQuestsRequired: 3,
    gradient: 'linear-gradient(145deg, #bf360c 0%, #ff7043 50%, #ffcc80 100%)',
    icon: 'flame',
  },
  {
    id: 'pirate-bay',
    name: 'Pirate Bay',
    description: 'Numbers, maps, and clever patterns.',
    theme: 'maths',
    unlockQuestsRequired: 4,
    gradient: 'linear-gradient(145deg, #4e342e 0%, #8d6e63 50%, #ffd54f 100%)',
    icon: 'map',
  },
  {
    id: 'whisper-ruins',
    name: 'Whisper Ruins',
    description: 'History tales and word magic.',
    theme: 'history',
    unlockQuestsRequired: 5,
    gradient: 'linear-gradient(145deg, #37474f 0%, #78909c 50%, #ffe0b2 100%)',
    icon: 'ruins',
  },
];

export const CATEGORIES = [
  'Numbers and Maths',
  'Words and Language',
  'Science',
  'Animals and Nature',
  'Geography',
  'History',
  'Space',
  'Ocean',
  'Indonesia and Local Knowledge',
  'General Knowledge',
  'Logic and Patterns',
  'Healthy Living and Safety',
] as const;

export const CATEGORY_TO_WORLD: Record<string, string> = {
  'Numbers and Maths': 'pirate-bay',
  'Words and Language': 'whisper-ruins',
  Science: 'volcano-valley',
  'Animals and Nature': 'jungle-trail',
  Geography: 'jungle-trail',
  History: 'whisper-ruins',
  Space: 'star-harbor',
  Ocean: 'coral-coast',
  'Indonesia and Local Knowledge': 'coral-coast',
  'General Knowledge': 'pirate-bay',
  'Logic and Patterns': 'pirate-bay',
  'Healthy Living and Safety': 'jungle-trail',
};

export function getWorld(id: string): WorldDefinition | undefined {
  return WORLDS.find((w) => w.id === id);
}
