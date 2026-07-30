import { completeRoundVerified } from '../../src/features/game/gameService';
import { CompleteRoundRequestSchema } from '../../src/schemas';
import { errorResponse, json, requestId, type Handler } from './_shared/http';
import { getServerRepo } from './_shared/repo';

export const handler: Handler = async (event) => {
  const rid = requestId();
  if (event.httpMethod !== 'POST') {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', 'POST only.', rid);
  }
  try {
    const body = JSON.parse(event.body || '{}') as unknown;
    const parsed = CompleteRoundRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(400, 'INVALID_BODY', 'Invalid complete-round body.', rid);
    }

    // B1: ignore client-supplied score/xp/coins/weeklyPoints
    const { roundId, playerId, attempts } = parsed.data;

    const repo = getServerRepo();
    const result = await completeRoundVerified(repo, {
      roundId,
      playerId,
      attempts,
    });
    return json(200, { result, requestId: rid });
  } catch (e) {
    const err = e as { code?: string; message?: string };
    const code = err.code ?? 'INTERNAL';
    if (code === 'ROUND_ALREADY_COMPLETED') {
      return errorResponse(409, code, 'This quest is already finished.', rid);
    }
    if (code === 'ROUND_NOT_FOUND') {
      return errorResponse(404, code, 'Quest not found.', rid);
    }
    const status =
      code === 'PLAYER_MISMATCH' ||
      code === 'ATTEMPT_COUNT_MISMATCH' ||
      code === 'QUESTION_ORDER_MISMATCH' ||
      code === 'POWERUP_OVERUSE' ||
      code === 'INVALID_QUESTION'
        ? 400
        : 500;
    return errorResponse(status, code, err.message ?? 'Something wobbled.', rid);
  }
};
