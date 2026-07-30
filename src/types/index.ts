/** Domain types — Design Director canonical shapes */

export type DifficultyLevel = 1 | 2 | 3 | 4;

export type AgeBand = '6-7' | '8-9' | '10-11' | 'advanced';

export type Player = {
  id: string;
  displayName: string;
  birthYear?: number;
  ageBand: AgeBand;
  difficultyLevel: DifficultyLevel;
  avatarId: string;
  guideCharacterId: string;
  xp: number;
  level: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type QuestionStatus = 'draft' | 'reviewed' | 'active' | 'retired';

export type QuestionType = 'multiple-choice' | 'true-false' | 'image-choice';

export type AnswerOption = {
  id: string;
  text: string;
  image?: string;
};

export type Question = {
  id: string;
  status: QuestionStatus;
  type: QuestionType;
  category: string;
  subcategory?: string;
  worldId: string;
  difficulty: DifficultyLevel;
  minimumAge?: number;
  maximumAge?: number;
  question: string;
  shortQuestion?: string;
  answers: AnswerOption[];
  correctAnswerId: string;
  explanation: string;
  funFact?: string;
  hint?: string;
  image?: string;
  sourceName?: string;
  sourceUrl?: string;
  licence?: string;
  tags: string[];
  timeLimitMs?: number;
  createdAt: string;
  reviewedAt?: string;
};

export type RoundMode =
  | 'quick-play'
  | 'world-quest'
  | 'daily-challenge'
  | 'boss-battle'
  | 'rematch';

export type PowerUpId =
  | 'fifty-fifty'
  | 'extra-time'
  | 'ask-guide'
  | 'double-treasure'
  | 'second-chance'
  | 'shield';

export type RoundStatus = 'started' | 'completed' | 'abandoned' | 'rejected';

export type Round = {
  id: string;
  playerId: string;
  mode: RoundMode;
  worldId?: string;
  weekId: string;
  difficultyLevel: DifficultyLevel;
  questionIds: string[];
  powerUpsGranted: PowerUpId[];
  powerUpsRemaining: Partial<Record<PowerUpId, number>>;
  status: RoundStatus;
  startedAt: string;
  expiresAt: string;
  completedAt?: string;
  version?: number;
};

export type AttemptInput = {
  questionId: string;
  selectedAnswerId: string | null;
  responseTimeMs: number;
  powerUpsUsed: PowerUpId[];
  secondChanceSelectedAnswerId?: string;
};

export type Attempt = {
  id: string;
  roundId: string;
  playerId: string;
  questionId: string;
  selectedAnswerId: string | null;
  correct: boolean;
  responseTimeMs: number;
  powerUpsUsed: PowerUpId[];
  basePoints: number;
  speedBonus: number;
  streakBonus: number;
  powerUpMultiplier: number;
  pointsAwarded: number;
  attemptedAt: string;
};

export type CompletedRoundResult = {
  round: Round;
  attempts: Attempt[];
  correctCount: number;
  score: number;
  xpEarned: number;
  coinsEarned: number;
  durationMs: number;
  streakAfter: number;
  bonuses: {
    firstRoundOfDay: number;
    dailyChallenge: number;
    perfectRound: number;
    rematchRecovery: number;
  };
  achievementsUnlocked: string[];
  leaderboard: WeeklyLeaderboardEntry;
};

export type WeekId = string;

export type WeeklyLeaderboardEntry = {
  playerId: string;
  weekId: WeekId;
  points: number;
  questsCompleted: number;
  correctAnswers: number;
  dailyChallengesCompleted: number;
  bestStreak: number;
  achievementIds: string[];
  updatedAt: string;
};

export type WeeklyLeaderboard = {
  weekId: WeekId;
  timezone: 'Asia/Makassar';
  startsAt: string;
  endsAt: string;
  entries: WeeklyLeaderboardEntry[];
};

export type WeeklyReward = {
  id: string;
  weekId: WeekId;
  participationReward: string;
  championBonus?: string;
  minimumQuests: number;
  enabled: boolean;
  updatedAt: string;
};

export type GuidePersonality = 'calm' | 'funny' | 'adventurous' | 'energetic';

export type GuideCharacter = {
  id: string;
  name: string;
  description: string;
  voiceKey: string;
  image: string;
  previewText: string;
  personality: GuidePersonality;
  enabled: boolean;
};

export type WorldDefinition = {
  id: string;
  name: string;
  description: string;
  theme: string;
  unlockQuestsRequired: number;
  gradient: string;
  icon: string;
};

export type CompleteRoundRequest = {
  roundId: string;
  playerId: string;
  attempts: AttemptInput[];
  clientCompletedAt: string;
  /** Client may send these; server MUST ignore for scoring */
  score?: number;
  xp?: number;
  coins?: number;
  weeklyPoints?: number;
};

export type StartRoundRequest = {
  playerId: string;
  mode: RoundMode;
  worldId?: string;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
};
