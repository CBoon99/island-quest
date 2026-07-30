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

  let body: { weekId?: string; confirm?: boolean };
  try {
    body = JSON.parse(event.body || '{}') as typeof body;
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'Invalid JSON body.', rid);
  }

  if (body.confirm !== true) {
    return errorResponse(
      400,
      'CONFIRM_REQUIRED',
      'Send confirm: true to reset the week board.',
      rid,
    );
  }

  const weekId = body.weekId?.trim() || currentWeekId();
  const repo = getServerRepo();
  if (!repo.resetWeekLeaderboard) {
    return errorResponse(500, 'NOT_SUPPORTED', 'Reset not supported.', rid);
  }

  await repo.resetWeekLeaderboard(weekId);
  return json(200, { ok: true, weekId, requestId: rid });
};

export default { handler };
