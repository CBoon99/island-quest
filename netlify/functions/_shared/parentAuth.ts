import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4h idle/session
const PIN_FAIL_LIMIT = 5;
const PIN_FAIL_WINDOW_MS = 15 * 60 * 1000;

export { PIN_FAIL_LIMIT, PIN_FAIL_WINDOW_MS, SESSION_TTL_MS };

export function getSessionSecret(): string {
  return process.env.SESSION_SECRET || 'change-me-local-only';
}

/** Hash a PIN for comparison. Prefer pre-set PARENT_PIN_HASH in env. */
export function hashPin(pin: string, secret = getSessionSecret()): string {
  return createHash('sha256').update(`iq-pin:${secret}:${pin}`).digest('hex');
}

export function expectedPinHash(): string {
  const fromEnv = process.env.PARENT_PIN_HASH?.trim();
  if (fromEnv) return fromEnv;
  const pin = process.env.PARENT_PIN || '2468';
  return hashPin(pin);
}

export function verifyPin(pin: string): boolean {
  const expected = expectedPinHash();
  const actual = hashPin(pin);
  try {
    const a = Buffer.from(actual, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return actual === expected;
  }
}

export type ParentSessionPayload = {
  role: 'parent';
  exp: number;
  iat: number;
};

function b64url(data: string): string {
  return Buffer.from(data, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromB64url(data: string): string {
  const pad = data.length % 4 === 0 ? '' : '='.repeat(4 - (data.length % 4));
  const b64 = data.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return Buffer.from(b64, 'base64').toString('utf8');
}

export function createParentSessionToken(
  now = Date.now(),
  secret = getSessionSecret(),
): string {
  const payload: ParentSessionPayload = {
    role: 'parent',
    iat: now,
    exp: now + SESSION_TTL_MS,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyParentSessionToken(
  token: string | undefined | null,
  now = Date.now(),
  secret = getSessionSecret(),
): { ok: true; payload: ParentSessionPayload } | { ok: false; reason: string } {
  if (!token || typeof token !== 'string') {
    return { ok: false, reason: 'MISSING_TOKEN' };
  }
  const parts = token.split('.');
  if (parts.length !== 2) return { ok: false, reason: 'MALFORMED' };
  const [body, sig] = parts;
  const expected = createHmac('sha256', secret).update(body).digest('base64url');
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, reason: 'BAD_SIG' };
    }
  } catch {
    return { ok: false, reason: 'BAD_SIG' };
  }
  try {
    const payload = JSON.parse(fromB64url(body)) as ParentSessionPayload;
    if (payload.role !== 'parent') return { ok: false, reason: 'ROLE' };
    if (typeof payload.exp !== 'number' || payload.exp < now) {
      return { ok: false, reason: 'EXPIRED' };
    }
    return { ok: true, payload };
  } catch {
    return { ok: false, reason: 'MALFORMED' };
  }
}

export function extractBearer(
  headers: Record<string, string | undefined> | null | undefined,
): string | null {
  if (!headers) return null;
  const auth =
    headers.authorization ||
    headers.Authorization ||
    headers['x-parent-session'] ||
    headers['X-Parent-Session'];
  if (!auth) return null;
  if (auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  return auth.trim();
}

export function requireParentAuth(
  headers: Record<string, string | undefined> | null | undefined,
):
  | { ok: true; payload: ParentSessionPayload; token: string }
  | { ok: false; status: number; code: string; message: string } {
  const token = extractBearer(headers);
  const result = verifyParentSessionToken(token);
  if (!result.ok) {
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Parent session required or expired.',
    };
  }
  return { ok: true, payload: result.payload, token: token! };
}
