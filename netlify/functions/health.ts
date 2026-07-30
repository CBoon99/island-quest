import { json, requestId, type Handler } from './_shared/http';

export const handler: Handler = async () => {
  return json(200, {
    ok: true,
    service: 'island-quest',
    requestId: requestId(),
    time: new Date().toISOString(),
  });
};
