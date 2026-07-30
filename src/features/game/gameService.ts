import { loadActiveQuestions, questionsById } from '../../data/questions';
import {
  defaultPowerUpsForMode,
  modeQuestionCount,
  selectQuestions,
} from '../../lib/selection';
import { scoreRound, POWER_UP_MAX_PER_ROUND } from '../../lib/scoring';
import { localDateMakassar, weekId } from '../../lib/week';
import type { GameRepository } from '../../repositories/types';
import type {
  AttemptInput,
  CompletedRoundResult,
  PowerUpId,
  Question,
  Round,
  RoundMode,
} from '../../types';

function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export async function startRound(
  repo: GameRepository,
  input: { playerId: string; mode: RoundMode; worldId?: string },
): Promise<{ round: Round; questions: Question[] }> {
  const player = await repo.getPlayer(input.playerId);
  if (!player || !player.enabled) {
    throw Object.assign(new Error('Player not found'), { code: 'PLAYER_NOT_FOUND' });
  }

  const bank = loadActiveQuestions();
  const recent = await repo.listRecentQuestionIds(player.id);
  const count = modeQuestionCount(input.mode);
  const seed = `${player.id}|${weekId()}|${input.mode}|${localDateMakassar()}|${Date.now()}`;
  const { questionIds } = selectQuestions(bank, {
    player,
    mode: input.mode,
    worldId: input.worldId,
    count,
    now: new Date(),
    recentQuestionIds: recent,
    weakCategoryIds: [],
    enabledCategories: [],
    rngSeed: seed,
  });

  if (questionIds.length < count && questionIds.length === 0) {
    throw Object.assign(new Error('Not enough questions'), {
      code: 'INSUFFICIENT_QUESTIONS',
    });
  }

  const granted = defaultPowerUpsForMode(input.mode);
  const remaining: Partial<Record<PowerUpId, number>> = {};
  for (const p of granted) {
    remaining[p] = POWER_UP_MAX_PER_ROUND[p];
  }

  const now = new Date();
  const round: Round = {
    id: newId('rnd'),
    playerId: player.id,
    mode: input.mode,
    worldId: input.worldId,
    weekId: weekId(now),
    difficultyLevel: player.difficultyLevel,
    questionIds,
    powerUpsGranted: granted,
    powerUpsRemaining: remaining,
    status: 'started',
    startedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
  };

  await repo.createRound(round);
  await repo.recordQuestionsPlayed(player.id, questionIds);

  const map = questionsById();
  const questions = questionIds
    .map((id) => map.get(id))
    .filter((q): q is Question => Boolean(q));

  return { round, questions };
}

export async function completeRoundVerified(
  repo: GameRepository,
  input: {
    roundId: string;
    playerId: string;
    attempts: AttemptInput[];
  },
): Promise<CompletedRoundResult> {
  const round = await repo.getRound(input.roundId);
  if (!round) {
    throw Object.assign(new Error('Round not found'), { code: 'ROUND_NOT_FOUND' });
  }
  if (round.status === 'completed') {
    throw Object.assign(new Error('Round already completed'), {
      code: 'ROUND_ALREADY_COMPLETED',
    });
  }
  if (round.playerId !== input.playerId) {
    throw Object.assign(new Error('Player mismatch'), { code: 'PLAYER_MISMATCH' });
  }

  const player = await repo.getPlayer(input.playerId);
  if (!player) {
    throw Object.assign(new Error('Player not found'), { code: 'PLAYER_NOT_FOUND' });
  }

  const map = questionsById();
  const now = new Date();
  const localDate = localDateMakassar(now);
  const isFirst = await repo.wasFirstRoundOfLocalDay(player.id, localDate);

  const scored = scoreRound(round, map, input.attempts, player, {
    weekId: round.weekId,
    isFirstCompletedRoundOfLocalDay: isFirst,
    now,
  });

  if (!scored.ok) {
    throw Object.assign(new Error(scored.error.message), { code: scored.error.code });
  }

  const version = await repo.getVersion();
  try {
    const { result } = await repo.completeRoundAtomic({
      expectedVersion: version,
      result: scored.result,
      playerPatch: scored.playerPatch,
      weekId: round.weekId,
    });
    if (isFirst) {
      await repo.markFirstRoundOfLocalDay(player.id, localDate);
    }
    return result;
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === 'VERSION_CONFLICT') {
      const version2 = await repo.getVersion();
      const { result } = await repo.completeRoundAtomic({
        expectedVersion: version2,
        result: scored.result,
        playerPatch: scored.playerPatch,
        weekId: round.weekId,
      });
      if (isFirst) {
        await repo.markFirstRoundOfLocalDay(player.id, localDate);
      }
      return result;
    }
    throw e;
  }
}
