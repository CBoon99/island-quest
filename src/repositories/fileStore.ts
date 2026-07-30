/**
 * Durable file-backed GameRepository for local/dev Netlify Functions.
 * Survives process restarts. Netlify production can set IQ_STORE_PATH
 * or use Blobs adapter (see blobsStore.ts) when site Blobs is configured.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  createEmptySnapshot,
  MemoryGameRepository,
} from './memory';
import type { GameRepository, PlayerPatch, StoreSnapshot } from './types';
import type {
  CompletedRoundResult,
  Player,
  Round,
  WeeklyLeaderboard,
  WeeklyLeaderboardEntry,
  WeeklyReward,
} from '@/types';

function loadSnapshot(path: string): StoreSnapshot {
  try {
    if (!existsSync(path)) return createEmptySnapshot();
    const raw = readFileSync(path, 'utf8');
    const parsed = JSON.parse(raw) as StoreSnapshot;
    if (!parsed || typeof parsed.version !== 'number' || !Array.isArray(parsed.players)) {
      return createEmptySnapshot();
    }
    return {
      version: parsed.version,
      players: parsed.players,
      rounds: parsed.rounds ?? {},
      completedResults: parsed.completedResults ?? {},
      leaderboards: parsed.leaderboards ?? {},
      rewards: parsed.rewards ?? {},
      recentQuestions: parsed.recentQuestions ?? {},
      firstRoundDates: parsed.firstRoundDates ?? {},
    };
  } catch {
    return createEmptySnapshot();
  }
}

function saveSnapshot(path: string, snap: StoreSnapshot): void {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(snap, null, 2), 'utf8');
  renameSync(tmp, path);
}

export class FileGameRepository implements GameRepository {
  private inner: MemoryGameRepository;
  private readonly path: string;

  constructor(path: string) {
    this.path = path;
    this.inner = new MemoryGameRepository(loadSnapshot(path));
  }

  private persist(): void {
    saveSnapshot(this.path, this.inner.getSnapshot());
  }

  getSnapshot(): StoreSnapshot {
    return this.inner.getSnapshot();
  }

  async getVersion(): Promise<number> {
    return this.inner.getVersion();
  }

  async listPlayers(): Promise<Player[]> {
    return this.inner.listPlayers();
  }

  async getPlayer(id: string): Promise<Player | null> {
    return this.inner.getPlayer(id);
  }

  async updatePlayer(id: string, patch: PlayerPatch): Promise<Player> {
    const p = await this.inner.updatePlayer(id, patch);
    this.persist();
    return p;
  }

  async createRound(round: Round): Promise<Round> {
    const r = await this.inner.createRound(round);
    this.persist();
    return r;
  }

  async getRound(id: string): Promise<Round | null> {
    return this.inner.getRound(id);
  }

  async completeRoundAtomic(input: {
    expectedVersion: number;
    result: CompletedRoundResult;
    playerPatch: PlayerPatch;
    weekId: string;
  }): Promise<{ version: number; result: CompletedRoundResult }> {
    const out = await this.inner.completeRoundAtomic(input);
    this.persist();
    return out;
  }

  async getLeaderboard(weekId: string): Promise<WeeklyLeaderboard> {
    return this.inner.getLeaderboard(weekId);
  }

  async getWeeklyReward(weekId: string): Promise<WeeklyReward | null> {
    return this.inner.getWeeklyReward(weekId);
  }

  async upsertWeeklyReward(reward: WeeklyReward): Promise<void> {
    await this.inner.upsertWeeklyReward(reward);
    this.persist();
  }

  async listRecentQuestionIds(playerId: string, limit?: number): Promise<string[]> {
    return this.inner.listRecentQuestionIds(playerId, limit);
  }

  async recordQuestionsPlayed(playerId: string, questionIds: string[]): Promise<void> {
    await this.inner.recordQuestionsPlayed(playerId, questionIds);
    this.persist();
  }

  async wasFirstRoundOfLocalDay(playerId: string, localDate: string): Promise<boolean> {
    return this.inner.wasFirstRoundOfLocalDay(playerId, localDate);
  }

  async markFirstRoundOfLocalDay(playerId: string, localDate: string): Promise<void> {
    await this.inner.markFirstRoundOfLocalDay(playerId, localDate);
    this.persist();
  }

  async addBonusPoints(input: {
    playerId: string;
    weekId: string;
    points: number;
    reason?: string;
  }): Promise<WeeklyLeaderboardEntry> {
    const e = await this.inner.addBonusPoints!(input);
    this.persist();
    return e;
  }

  async resetWeekLeaderboard(weekId: string): Promise<void> {
    await this.inner.resetWeekLeaderboard!(weekId);
    this.persist();
  }
}
