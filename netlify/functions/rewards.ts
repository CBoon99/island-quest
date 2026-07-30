import { weekId } from '../../src/lib/week';
import { errorResponse, json, requestId, type Handler } from './_shared/http';
import { getServerRepo } from './_shared/repo';

export const handler: Handler = async (event) => {
  const rid = requestId();
  try {
    const week = event.queryStringParameters?.week || weekId();
    const repo = getServerRepo();
    let reward = await repo.getWeeklyReward(week);
    if (!reward) {
      reward = {
        id: `rw_${week}`,
        weekId: week,
        participationReward: 'Family movie night pick',
        championBonus: 'Extra beach ice cream',
        minimumQuests: 3,
        enabled: true,
        updatedAt: new Date().toISOString(),
      };
    }
    return json(200, { reward, requestId: rid });
  } catch {
    return errorResponse(500, 'INTERNAL', 'Something wobbled.', rid);
  }
};
