import { requireParentAuth } from './_shared/parentAuth';
import { errorResponse, json, requestId, type Handler } from './_shared/http';
import { getServerRepo } from './_shared/repo';
import { weekId as currentWeekId } from '../../src/lib/week';
import type { WeeklyReward } from '../../src/types';

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
    weekId?: string;
    participationReward?: string;
    championBonus?: string;
    minimumQuests?: number;
    enabled?: boolean;
  };
  try {
    body = JSON.parse(event.body || '{}') as typeof body;
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'Invalid JSON body.', rid);
  }

  const weekId = body.weekId?.trim() || currentWeekId();
  const participationReward = body.participationReward?.trim() ?? '';
  if (!participationReward || participationReward.length > 200) {
    return errorResponse(
      400,
      'INVALID_REWARD',
      'Participation reward is required (max 200 chars).',
      rid,
    );
  }

  const minimumQuests =
    typeof body.minimumQuests === 'number' && body.minimumQuests >= 0
      ? Math.floor(body.minimumQuests)
      : 1;

  const repo = getServerRepo();
  const existing = await repo.getWeeklyReward(weekId);
  const reward: WeeklyReward = {
    id: existing?.id ?? `rw_${weekId}`,
    weekId,
    participationReward,
    championBonus: body.championBonus?.trim() || undefined,
    minimumQuests,
    enabled: body.enabled !== false,
    updatedAt: new Date().toISOString(),
  };
  await repo.upsertWeeklyReward(reward);
  return json(200, { reward, requestId: rid });
};

export default { handler };
