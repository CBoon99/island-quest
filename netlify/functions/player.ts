import { errorResponse, json, requestId, type Handler } from './_shared/http';
import { getServerRepo } from './_shared/repo';

export const handler: Handler = async (event) => {
  const rid = requestId();
  try {
    const id = event.queryStringParameters?.id;
    if (!id) {
      return errorResponse(400, 'MISSING_ID', 'Player id required.', rid);
    }
    const repo = getServerRepo();
    const player = await repo.getPlayer(id);
    if (!player) {
      return errorResponse(404, 'PLAYER_NOT_FOUND', 'Explorer not found.', rid);
    }
    return json(200, { player, requestId: rid });
  } catch {
    return errorResponse(500, 'INTERNAL', 'Something wobbled.', rid);
  }
};
