import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryGameRepository } from '@/repositories/memory';
import { completeRoundVerified, startRound } from '@/features/game/gameService';
import { loadActiveQuestions } from '@/data/questions';

describe('complete-round integrity', () => {
  let repo: MemoryGameRepository;

  beforeEach(() => {
    repo = new MemoryGameRepository();
  });

  it('has a playable question bank', () => {
    const active = loadActiveQuestions();
    expect(active.length).toBeGreaterThanOrEqual(40);
  });

  it('server scores and rejects client inflated totals by never accepting them', async () => {
    const { round, questions } = await startRound(repo, {
      playerId: 'pl_ayla',
      mode: 'quick-play',
    });
    expect(round.questionIds.length).toBeGreaterThan(0);

    const attempts = round.questionIds.map((qid, i) => {
      const q = questions.find((x) => x.id === qid)!;
      return {
        questionId: qid,
        selectedAnswerId: i === 0 ? q.correctAnswerId : q.answers[1]?.id ?? null,
        responseTimeMs: 2000,
        powerUpsUsed: [] as const,
      };
    });

    const result = await completeRoundVerified(repo, {
      roundId: round.id,
      playerId: 'pl_ayla',
      attempts: attempts.map((a) => ({ ...a, powerUpsUsed: [...a.powerUpsUsed] })),
    });

    expect(result.score).toBeLessThan(999999);
    expect(result.round.status).toBe('completed');
    expect(result.correctCount).toBeGreaterThanOrEqual(1);

    const player = await repo.getPlayer('pl_ayla');
    expect(player?.xp).toBeGreaterThan(150);

    const board = await repo.getLeaderboard(round.weekId);
    const entry = board.entries.find((e) => e.playerId === 'pl_ayla');
    expect(entry?.points).toBe(result.score);
  });

  it('rejects duplicate complete of same roundId', async () => {
    const { round, questions } = await startRound(repo, {
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

    await completeRoundVerified(repo, {
      roundId: round.id,
      playerId: 'pl_aryan',
      attempts: attempts.map((a) => ({
        ...a,
        powerUpsUsed: [],
      })),
    });

    await expect(
      completeRoundVerified(repo, {
        roundId: round.id,
        playerId: 'pl_aryan',
        attempts: attempts.map((a) => ({
          ...a,
          powerUpsUsed: [],
        })),
      }),
    ).rejects.toMatchObject({ code: 'ROUND_ALREADY_COMPLETED' });
  });
});
