import { SEED_PLAYERS } from '@/config/players';
import { weekBounds } from '@/lib/week';
import type {
  CompletedRoundResult,
  Player,
  Round,
  WeeklyLeaderboard,
  WeeklyLeaderboardEntry,
  WeeklyReward,
} from '@/types';
import type { GameRepository, PlayerPatch, StoreSnapshot } from './types';

function clonePlayers(): Player[] {
  return SEED_PLAYERS.map((p) => ({ ...p }));
}

export function createEmptySnapshot(): StoreSnapshot {
  return {
    version: 1,
    players: clonePlayers(),
    rounds: {},
    completedResults: {},
    leaderboards: {},
    rewards: {},
    recentQuestions: {},
    firstRoundDates: {},
  };
}

export class MemoryGameRepository implements GameRepository {
  private store: StoreSnapshot;

  constructor(initial?: StoreSnapshot) {
    this.store = initial ?? createEmptySnapshot();
  }

  /** Test helper */
  getSnapshot(): StoreSnapshot {
    return this.store;
  }

  async getVersion(): Promise<number> {
    return this.store.version;
  }

  async listPlayers(): Promise<Player[]> {
    return this.store.players.filter((p) => p.enabled).map((p) => ({ ...p }));
  }

  async getPlayer(id: string): Promise<Player | null> {
    const p = this.store.players.find((x) => x.id === id);
    return p ? { ...p } : null;
  }

  async updatePlayer(id: string, patch: PlayerPatch): Promise<Player> {
    const idx = this.store.players.findIndex((x) => x.id === id);
    if (idx < 0) throw new Error('PLAYER_NOT_FOUND');
    const updated: Player = {
      ...this.store.players[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.store.players[idx] = updated;
    this.store.version += 1;
    return { ...updated };
  }

  async createRound(round: Round): Promise<Round> {
    this.store.rounds[round.id] = { ...round, version: this.store.version };
    this.store.version += 1;
    return { ...this.store.rounds[round.id] };
  }

  async getRound(id: string): Promise<Round | null> {
    const r = this.store.rounds[id];
    return r ? { ...r } : null;
  }

  async completeRoundAtomic(input: {
    expectedVersion: number;
    result: CompletedRoundResult;
    playerPatch: PlayerPatch;
    weekId: string;
  }): Promise<{ version: number; result: CompletedRoundResult }> {
    // Versioned write with single retry semantics handled by caller;
    // here we enforce expectedVersion match.
    if (input.expectedVersion !== this.store.version) {
      throw Object.assign(new Error('VERSION_CONFLICT'), { code: 'VERSION_CONFLICT' });
    }

    const roundId = input.result.round.id;
    const existing = this.store.rounds[roundId];
    if (!existing) {
      throw Object.assign(new Error('ROUND_NOT_FOUND'), { code: 'ROUND_NOT_FOUND' });
    }
    if (existing.status === 'completed' || this.store.completedResults[roundId]) {
      throw Object.assign(new Error('ROUND_ALREADY_COMPLETED'), {
        code: 'ROUND_ALREADY_COMPLETED',
        prior: this.store.completedResults[roundId],
      });
    }

    this.store.rounds[roundId] = { ...input.result.round };
    this.store.completedResults[roundId] = input.result;

    const playerId = input.result.round.playerId;
    const pIdx = this.store.players.findIndex((p) => p.id === playerId);
    if (pIdx >= 0) {
      this.store.players[pIdx] = {
        ...this.store.players[pIdx],
        ...input.playerPatch,
        updatedAt: new Date().toISOString(),
      };
    }

    const entries = this.store.leaderboards[input.weekId] ?? [];
    const eIdx = entries.findIndex((e) => e.playerId === playerId);
    const delta = input.result.leaderboard;
    if (eIdx >= 0) {
      const prev = entries[eIdx];
      entries[eIdx] = {
        ...prev,
        points: prev.points + delta.points,
        questsCompleted: prev.questsCompleted + delta.questsCompleted,
        correctAnswers: prev.correctAnswers + delta.correctAnswers,
        dailyChallengesCompleted:
          prev.dailyChallengesCompleted + delta.dailyChallengesCompleted,
        bestStreak: Math.max(prev.bestStreak, delta.bestStreak),
        updatedAt: delta.updatedAt,
      };
    } else {
      entries.push({ ...delta });
    }
    this.store.leaderboards[input.weekId] = entries;

    this.store.version += 1;
    return { version: this.store.version, result: input.result };
  }

  async getLeaderboard(weekId: string): Promise<WeeklyLeaderboard> {
    const bounds = weekBounds();
    const entries = [...(this.store.leaderboards[weekId] ?? [])].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.questsCompleted !== a.questsCompleted)
        return b.questsCompleted - a.questsCompleted;
      if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
      return a.playerId.localeCompare(b.playerId);
    });
    return {
      weekId,
      timezone: 'Asia/Makassar',
      startsAt: bounds.startsAt,
      endsAt: bounds.endsAt,
      entries,
    };
  }

  async getWeeklyReward(weekId: string): Promise<WeeklyReward | null> {
    return this.store.rewards[weekId] ? { ...this.store.rewards[weekId] } : null;
  }

  async upsertWeeklyReward(reward: WeeklyReward): Promise<void> {
    this.store.rewards[reward.weekId] = { ...reward };
    this.store.version += 1;
  }

  async listRecentQuestionIds(playerId: string, limit = 50): Promise<string[]> {
    return (this.store.recentQuestions[playerId] ?? []).slice(-limit);
  }

  async recordQuestionsPlayed(playerId: string, questionIds: string[]): Promise<void> {
    const prev = this.store.recentQuestions[playerId] ?? [];
    this.store.recentQuestions[playerId] = [...prev, ...questionIds].slice(-200);
  }

  async wasFirstRoundOfLocalDay(playerId: string, localDate: string): Promise<boolean> {
    return this.store.firstRoundDates[playerId] !== localDate;
  }

  async markFirstRoundOfLocalDay(playerId: string, localDate: string): Promise<void> {
    this.store.firstRoundDates[playerId] = localDate;
  }

  async addBonusPoints(input: {
    playerId: string;
    weekId: string;
    points: number;
    reason?: string;
  }): Promise<WeeklyLeaderboardEntry> {
    const now = new Date().toISOString();
    const entries = this.store.leaderboards[input.weekId] ?? [];
    const idx = entries.findIndex((e) => e.playerId === input.playerId);
    if (idx >= 0) {
      entries[idx] = {
        ...entries[idx],
        points: entries[idx].points + input.points,
        updatedAt: now,
      };
    } else {
      entries.push({
        playerId: input.playerId,
        weekId: input.weekId,
        points: input.points,
        questsCompleted: 0,
        correctAnswers: 0,
        dailyChallengesCompleted: 0,
        bestStreak: 0,
        achievementIds: input.reason ? [`bonus:${input.reason}`] : [],
        updatedAt: now,
      });
    }
    this.store.leaderboards[input.weekId] = entries;
    this.store.version += 1;
    return { ...entries[idx >= 0 ? idx : entries.length - 1] };
  }

  async resetWeekLeaderboard(weekId: string): Promise<void> {
    this.store.leaderboards[weekId] = [];
    this.store.version += 1;
  }
}

/** Singleton for client fixture mode */
let clientMemory: MemoryGameRepository | null = null;

const EXPECTED_SEED_IDS = new Set(SEED_PLAYERS.map((p) => p.id));

function seedMatches(repo: MemoryGameRepository): boolean {
  const snap = repo.getSnapshot();
  const ids = new Set(snap.players.map((p) => p.id));
  if (ids.size !== EXPECTED_SEED_IDS.size) return false;
  for (const id of EXPECTED_SEED_IDS) {
    if (!ids.has(id)) return false;
  }
  return true;
}

export function getClientMemoryRepo(): MemoryGameRepository {
  if (!clientMemory) {
    clientMemory = new MemoryGameRepository();
  } else if (!seedMatches(clientMemory)) {
    // Reseed when player roster changes (e.g. Aryan → Ayla)
    clientMemory = new MemoryGameRepository();
  }
  return clientMemory;
}

export function resetClientMemoryRepo(): void {
  clientMemory = new MemoryGameRepository();
}
