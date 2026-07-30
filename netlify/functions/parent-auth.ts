import {
  createParentSessionToken,
  PIN_FAIL_LIMIT,
  PIN_FAIL_WINDOW_MS,
  verifyPin,
} from './_shared/parentAuth';
import {
  clearRateLimit,
  clientKey,
  isLocked,
  recordFailure,
} from './_shared/rateLimit';
import { errorResponse, json, requestId, type Handler } from './_shared/http';

export const handler: Handler = async (event) => {
  const rid = requestId();
  if (event.httpMethod !== 'POST') {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', 'POST only.', rid);
  }

  let body: { pin?: string };
  try {
    body = JSON.parse(event.body || '{}') as { pin?: string };
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'Invalid JSON body.', rid);
  }

  const pin = typeof body.pin === 'string' ? body.pin.trim() : '';
  if (!/^\d{4,6}$/.test(pin)) {
    return errorResponse(400, 'INVALID_PIN', 'PIN must be 4–6 digits.', rid);
  }

  const headers = (event as { headers?: Record<string, string | undefined> }).headers;
  const ip = clientKey({ headers });
  const failKey = `pin-fail:${ip}`;

  const lock = isLocked(failKey, PIN_FAIL_LIMIT, PIN_FAIL_WINDOW_MS);
  if (lock.locked) {
    return errorResponse(
      429,
      'RATE_LIMITED',
      'Too many PIN attempts. Try again in a few minutes.',
      rid,
    );
  }

  if (!verifyPin(pin)) {
    recordFailure(failKey, PIN_FAIL_LIMIT, PIN_FAIL_WINDOW_MS);
    const after = isLocked(failKey, PIN_FAIL_LIMIT, PIN_FAIL_WINDOW_MS);
    if (after.locked) {
      return errorResponse(
        429,
        'RATE_LIMITED',
        'Too many PIN attempts. Try again in a few minutes.',
        rid,
      );
    }
    return errorResponse(401, 'WRONG_PIN', 'That PIN didn’t work.', rid);
  }

  clearRateLimit(failKey);
  const token = createParentSessionToken();
  return json(200, {
    token,
    expiresInMs: 4 * 60 * 60 * 1000,
    requestId: rid,
  });
};

export default { handler };
