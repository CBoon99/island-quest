import { errorResponse, json, requestId, type Handler } from './_shared/http';
import { getServerRepo } from './_shared/repo';

export const handler: Handler = async () => {
  const rid = requestId();
  try {
    const repo = getServerRepo();
    const players = await repo.listPlayers();
    return json(200, { players, requestId: rid });
  } catch {
    return errorResponse(500, 'INTERNAL', 'Something wobbled.', rid);
  }
};
