/** In-memory rate limiter for warm function instances (family-scale). */

export type RateBucket = {
  timestamps: number[];
};

declare global {
  // eslint-disable-next-line no-var
  var __iqRateLimits: Map<string, RateBucket> | undefined;
}

function store(): Map<string, RateBucket> {
  if (!globalThis.__iqRateLimits) {
    globalThis.__iqRateLimits = new Map();
  }
  return globalThis.__iqRateLimits;
}

/**
 * Returns true if the action is allowed; false if rate limited.
 * Sliding window: max `limit` hits in `windowMs`.
 */
export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const map = store();
  const bucket = map.get(key) ?? { timestamps: [] };
  const cutoff = now - windowMs;
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    map.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, oldest + windowMs - now),
    };
  }

  bucket.timestamps.push(now);
  map.set(key, bucket);
  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    retryAfterMs: 0,
  };
}

/** Record a failure without counting successes (for PIN lockouts). */
export function recordFailure(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): { locked: boolean; failures: number; retryAfterMs: number } {
  const result = consumeRateLimit(key, limit, windowMs, now);
  if (!result.allowed) {
    return { locked: true, failures: limit, retryAfterMs: result.retryAfterMs };
  }
  const map = store();
  const bucket = map.get(key);
  const failures = bucket?.timestamps.length ?? 0;
  return {
    locked: failures >= limit,
    failures,
    retryAfterMs: result.retryAfterMs,
  };
}

export function isLocked(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): { locked: boolean; retryAfterMs: number; failures: number } {
  const map = store();
  const bucket = map.get(key);
  if (!bucket) return { locked: false, retryAfterMs: 0, failures: 0 };
  const cutoff = now - windowMs;
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
  map.set(key, bucket);
  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    return {
      locked: true,
      retryAfterMs: Math.max(0, oldest + windowMs - now),
      failures: bucket.timestamps.length,
    };
  }
  return { locked: false, retryAfterMs: 0, failures: bucket.timestamps.length };
}

export function clearRateLimit(key: string): void {
  store().delete(key);
}

export function resetAllRateLimits(): void {
  store().clear();
}

export function clientKey(event: {
  headers?: Record<string, string | undefined> | null;
  headersNormalized?: Record<string, string | undefined>;
}): string {
  const h = event.headers ?? {};
  const ip =
    h['x-forwarded-for']?.split(',')[0]?.trim() ||
    h['x-nf-client-connection-ip'] ||
    h['client-ip'] ||
    'local';
  return ip;
}
