import { z } from 'zod';

export const DifficultyLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const AgeBandSchema = z.enum(['6-7', '8-9', '10-11', 'advanced']);

export const PowerUpIdSchema = z.enum([
  'fifty-fifty',
  'extra-time',
  'ask-guide',
  'double-treasure',
  'second-chance',
  'shield',
]);

export const RoundModeSchema = z.enum([
  'quick-play',
  'world-quest',
  'daily-challenge',
  'boss-battle',
  'rematch',
]);

export const AnswerOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  image: z.string().optional(),
});

export const QuestionSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['draft', 'reviewed', 'active', 'retired']),
  type: z.enum(['multiple-choice', 'true-false', 'image-choice']),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  worldId: z.string().min(1),
  difficulty: DifficultyLevelSchema,
  minimumAge: z.number().optional(),
  maximumAge: z.number().optional(),
  question: z.string().min(1),
  shortQuestion: z.string().optional(),
  answers: z.array(AnswerOptionSchema).min(2),
  correctAnswerId: z.string().min(1),
  explanation: z.string().min(1),
  funFact: z.string().optional(),
  hint: z.string().optional(),
  image: z.string().optional(),
  sourceName: z.string().optional(),
  sourceUrl: z.string().optional(),
  licence: z.string().optional(),
  tags: z.array(z.string()),
  timeLimitMs: z.number().positive().optional(),
  createdAt: z.string(),
  reviewedAt: z.string().optional(),
});

export const PlayerSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  birthYear: z.number().optional(),
  ageBand: AgeBandSchema,
  difficultyLevel: DifficultyLevelSchema,
  avatarId: z.string(),
  guideCharacterId: z.string(),
  xp: z.number().nonnegative(),
  level: z.number().int().positive(),
  coins: z.number().nonnegative(),
  currentStreak: z.number().nonnegative(),
  longestStreak: z.number().nonnegative(),
  enabled: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AttemptInputSchema = z.object({
  questionId: z.string().min(1),
  selectedAnswerId: z.string().nullable(),
  responseTimeMs: z.number(),
  powerUpsUsed: z.array(PowerUpIdSchema),
  secondChanceSelectedAnswerId: z.string().optional(),
});

export const StartRoundRequestSchema = z.object({
  playerId: z.string().min(1),
  mode: RoundModeSchema,
  worldId: z.string().optional(),
});

export const CompleteRoundRequestSchema = z.object({
  roundId: z.string().min(1),
  playerId: z.string().min(1),
  attempts: z.array(AttemptInputSchema),
  clientCompletedAt: z.string(),
  score: z.number().optional(),
  xp: z.number().optional(),
  coins: z.number().optional(),
  weeklyPoints: z.number().optional(),
});
