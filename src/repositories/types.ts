import type {
  Attempt,
  CompletedRoundResult,
  Player,
  Round,
  WeeklyLeaderboard,
  WeeklyLeaderboardEntry,
  WeeklyReward,
} from '@/types';

export type PlayerPatch = Partial<
  Pick<
    Player,
    | 'displayName'
    | 'difficultyLevel'
    | 'guideCharacterId'
    | 'avatarId'
    | 'enabled'
    | 'xp'
    | 'coins'
    | 'level'
    | 'currentStreak'
    | 'longestStreak'
  >
>;

export type StoreSnapshot = {
  version: number;
  players: Player[];
  rounds: Record<string, Round>;
  completedResults: Record<string, CompletedRoundResult>;
  leaderboards: Record<string, WeeklyLeaderboardEntry[]>;
  rewards: Record<string, WeeklyReward>;
  recentQuestions: Record<string, string[]>;
  firstRoundDates: Record<string, string>; // playerId -> localDate last first-round
};

export interface GameRepository {
  getVersion(): Promise<number>;

  listPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | null>;
  updatePlayer(id: string, patch: PlayerPatch): Promise<Player>;

  createRound(round: Round): Promise<Round>;
  getRound(id: string): Promise<Round | null>;

  /**
   * Atomic complete: apply result + player patch + leaderboard in one versioned write.
   * Rejects if round already completed (caller should check).
   */
  completeRoundAtomic(input: {
    expectedVersion: number;
    result: CompletedRoundResult;
    playerPatch: PlayerPatch;
    weekId: string;
  }): Promise<{ version: number; result: CompletedRoundResult }>;

  getLeaderboard(weekId: string): Promise<WeeklyLeaderboard>;
  getWeeklyReward(weekId: string): Promise<WeeklyReward | null>;
  upsertWeeklyReward(reward: WeeklyReward): Promise<void>;

  listRecentQuestionIds(playerId: string, limit?: number): Promise<string[]>;
  recordQuestionsPlayed(playerId: string, questionIds: string[]): Promise<void>;

  wasFirstRoundOfLocalDay(playerId: string, localDate: string): Promise<boolean>;
  markFirstRoundOfLocalDay(playerId: string, localDate: string): Promise<void>;

  listAttemptsForPlayer?(playerId: string): Promise<Attempt[]>;

  /** Parent admin: adjust weekly board points (family friction). */
  addBonusPoints?(input: {
    playerId: string;
    weekId: string;
    points: number;
    reason?: string;
  }): Promise<WeeklyLeaderboardEntry>;

  /** Parent admin: clear weekly leaderboard entries for a week. */
  resetWeekLeaderboard?(weekId: string): Promise<void>;
}
