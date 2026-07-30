import { requireParentAuth } from './_shared/parentAuth';
import { errorResponse, json, requestId, type Handler } from './_shared/http';
import { getServerRepo } from './_shared/repo';
import { weekId as currentWeekId } from '../../src/lib/week';

export const handler: Handler = async (event) => {
  const rid = requestId();
  if (event.httpMethod !== 'POST') {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', 'POST only.', rid);
  }

  const headers = (event as { headers?: Record<string, string | undefined> }).headers;
  const auth = requireParentAuth(headers);
  if (!auth.ok) {
    return errorResponse(auth.status, auth.code, auth.message, rid);
  }

  let body: { playerId?: string; weekId?: string; points?: number; reason?: string };
  try {
    body = JSON.parse(event.body || '{}') as typeof body;
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'Invalid JSON body.', rid);
  }

  const playerId = body.playerId?.trim();
  if (!playerId) {
    return errorResponse(400, 'INVALID_PLAYER', 'playerId is required.', rid);
  }

  const points = body.points;
  if (typeof points !== 'number' || !Number.isFinite(points) || points === 0) {
    return errorResponse(400, 'INVALID_POINTS', 'points must be a non-zero number.', rid);
  }
  if (Math.abs(points) > 10_000) {
    return errorResponse(400, 'POINTS_CAP', 'Bonus points out of allowed range.', rid);
  }

  const weekId = body.weekId?.trim() || currentWeekId();
  const repo = getServerRepo();
  const player = await repo.getPlayer(playerId);
  if (!player) {
    return errorResponse(404, 'PLAYER_NOT_FOUND', 'Player not found.', rid);
  }

  if (!repo.addBonusPoints) {
    return errorResponse(500, 'NOT_SUPPORTED', 'Bonus points not supported.', rid);
  }

  const entry = await repo.addBonusPoints({
    playerId,
    weekId,
    points: Math.trunc(points),
    reason: body.reason?.trim().slice(0, 120),
  });

  return json(200, { entry, requestId: rid });
};

export default { handler };
