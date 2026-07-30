import type { GuideCharacter } from '@/types';

/**
 * Guide characters. Voice IDs live only in server env (ELEVENLABS_*_VOICE_ID).
 * voiceKey === character id used by /api/text-to-speech.
 */
export const CHARACTERS: GuideCharacter[] = [
  {
    id: 'captain-coral',
    name: 'Captain Coral',
    description: 'Brave reef captain who loves sunken treasure.',
    voiceKey: 'captain-coral',
    image: '/characters/captain-coral.svg',
    previewText: 'Ready to dive into your next adventure?',
    personality: 'adventurous',
    enabled: true,
  },
  {
    id: 'professor-paws',
    name: 'Professor Paws',
    description: 'Curious island cat with a map of secrets.',
    voiceKey: 'professor-paws',
    image: '/characters/professor-paws.svg',
    previewText: 'Curious minds find the best treasure.',
    personality: 'calm',
    enabled: true,
  },
  {
    id: 'nova',
    name: 'Nova',
    description: 'Star-hopping guide with cosmic jokes.',
    voiceKey: 'nova',
    image: '/characters/nova.svg',
    previewText: 'Blast off — facts wait among the stars!',
    personality: 'energetic',
    enabled: true,
  },
  {
    id: 'rex',
    name: 'Rex',
    description: 'Friendly dino explorer from Volcano Valley.',
    voiceKey: 'rex',
    image: '/characters/rex.svg',
    previewText: 'Roar! Let’s stomp into a quest!',
    personality: 'funny',
    enabled: true,
  },
  {
    id: 'miko',
    name: 'Miko',
    description: 'Island fox who knows every home-water trail.',
    voiceKey: 'miko',
    image: '/characters/miko.svg',
    previewText: 'Home waters call — adventure awaits!',
    personality: 'adventurous',
    enabled: true,
  },
];

/** Human labels for voice mapping docs (IDs never in client). */
export const CHARACTER_VOICE_LABELS: Record<string, string> = {
  'captain-coral': 'Callum',
  'professor-paws': 'Daniel',
  nova: 'Lily',
  rex: 'Bill',
  miko: 'Matilda',
};

export function getCharacter(id: string): GuideCharacter | undefined {
  return CHARACTERS.find((c) => c.id === id);
}
