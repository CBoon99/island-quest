import { requireParentAuth } from './_shared/parentAuth';
import { errorResponse, json, requestId, type Handler } from './_shared/http';
import { getServerRepo } from './_shared/repo';
import type { DifficultyLevel } from '../../src/types';
import type { PlayerPatch } from '../../src/repositories/types';

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

  let body: {
    playerId?: string;
    displayName?: string;
    difficultyLevel?: number;
    guideCharacterId?: string;
    enabled?: boolean;
  };
  try {
    body = JSON.parse(event.body || '{}') as typeof body;
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'Invalid JSON body.', rid);
  }

  const playerId = body.playerId?.trim();
  if (!playerId) {
    return errorResponse(400, 'INVALID_PLAYER', 'playerId is required.', rid);
  }

  const patch: PlayerPatch = {};
  if (typeof body.displayName === 'string' && body.displayName.trim()) {
    patch.displayName = body.displayName.trim().slice(0, 40);
  }
  if (
    body.difficultyLevel === 1 ||
    body.difficultyLevel === 2 ||
    body.difficultyLevel === 3 ||
    body.difficultyLevel === 4
  ) {
    patch.difficultyLevel = body.difficultyLevel as DifficultyLevel;
  }
  if (typeof body.guideCharacterId === 'string' && body.guideCharacterId.trim()) {
    patch.guideCharacterId = body.guideCharacterId.trim();
  }
  if (typeof body.enabled === 'boolean') {
    patch.enabled = body.enabled;
  }

  if (Object.keys(patch).length === 0) {
    return errorResponse(400, 'EMPTY_PATCH', 'No valid fields to update.', rid);
  }

  try {
    const repo = getServerRepo();
    const player = await repo.updatePlayer(playerId, patch);
    return json(200, { player, requestId: rid });
  } catch {
    return errorResponse(404, 'PLAYER_NOT_FOUND', 'Player not found.', rid);
  }
};

export default { handler };
