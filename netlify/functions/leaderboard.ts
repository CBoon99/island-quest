import { weekId } from '../../src/lib/week';
import { errorResponse, json, requestId, type Handler } from './_shared/http';
import { getServerRepo } from './_shared/repo';

export const handler: Handler = async (event) => {
  const rid = requestId();
  try {
    const week = event.queryStringParameters?.week || weekId();
    const repo = getServerRepo();
    const leaderboard = await repo.getLeaderboard(week);
    return json(200, { leaderboard, requestId: rid });
  } catch {
    return errorResponse(500, 'INTERNAL', 'Something wobbled.', rid);
  }
};
