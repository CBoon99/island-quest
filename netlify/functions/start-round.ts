import { startRound } from '../../src/features/game/gameService';
import { StartRoundRequestSchema } from '../../src/schemas';
import { errorResponse, json, requestId, type Handler } from './_shared/http';
import { getServerRepo } from './_shared/repo';

export const handler: Handler = async (event) => {
  const rid = requestId();
  if (event.httpMethod !== 'POST') {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', 'POST only.', rid);
  }
  try {
    const body = JSON.parse(event.body || '{}') as unknown;
    const parsed = StartRoundRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(400, 'INVALID_BODY', 'Invalid start-round body.', rid);
    }
    const repo = getServerRepo();
    const result = await startRound(repo, parsed.data);
    return json(200, { ...result, requestId: rid });
  } catch (e) {
    const err = e as { code?: string; message?: string };
    const code = err.code ?? 'INTERNAL';
    const status = code === 'PLAYER_NOT_FOUND' ? 404 : 500;
    return errorResponse(status, code, err.message ?? 'Something wobbled.', rid);
  }
};
