import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { FileGameRepository } from '@/repositories/fileStore';
import { completeRoundVerified, startRound } from '@/features/game/gameService';
import { weekId } from '@/lib/week';

const storePath = join(tmpdir(), `iq-test-store-${process.pid}.json`);

describe('FileGameRepository durability', () => {
  beforeEach(() => {
    if (existsSync(storePath)) unlinkSync(storePath);
    mkdirSync(join(tmpdir()), { recursive: true });
  });

  afterEach(() => {
    if (existsSync(storePath)) unlinkSync(storePath);
  });

  it('persists completed rounds across new repository instances', async () => {
    const repoA = new FileGameRepository(storePath);
    const { round, questions } = await startRound(repoA, {
      playerId: 'pl_aryan',
      mode: 'quick-play',
    });

    const attempts = round.questionIds.map((qid) => {
      const q = questions.find((x) => x.id === qid)!;
      return {
        questionId: qid,
        selectedAnswerId: q.correctAnswerId,
        responseTimeMs: 1500,
        powerUpsUsed: [] as string[],
      };
    });

    await completeRoundVerified(repoA, {
      roundId: round.id,
      playerId: 'pl_aryan',
      attempts,
    });

    expect(existsSync(storePath)).toBe(true);

    const repoB = new FileGameRepository(storePath);
    const board = await repoB.getLeaderboard(weekId());
    expect(board.entries.length).toBeGreaterThanOrEqual(1);
    expect(board.entries[0]!.points).toBeGreaterThan(0);

    const prior = await repoB.getRound(round.id);
    expect(prior?.status).toBe('completed');
  });
});
