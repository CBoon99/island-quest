import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { handler as parentAuth } from '../../netlify/functions/parent-auth';
import { handler as adminReward } from '../../netlify/functions/admin-reward';
import {
  createParentSessionToken,
  hashPin,
  verifyPin,
  verifyParentSessionToken,
} from '../../netlify/functions/_shared/parentAuth';
import { resetAllRateLimits } from '../../netlify/functions/_shared/rateLimit';
import { resetServerRepo } from '../../netlify/functions/_shared/repo';

describe('parent PIN crypto', () => {
  const prev = { ...process.env };

  beforeEach(() => {
    process.env.SESSION_SECRET = 'unit-test-secret';
    process.env.PARENT_PIN = '2468';
    delete process.env.PARENT_PIN_HASH;
  });

  afterEach(() => {
    process.env = { ...prev };
  });

  it('verifies default PIN and rejects wrong PIN', () => {
    expect(verifyPin('2468')).toBe(true);
    expect(verifyPin('0000')).toBe(false);
  });

  it('respects PARENT_PIN_HASH when set', () => {
    process.env.PARENT_PIN_HASH = hashPin('9999', 'unit-test-secret');
    expect(verifyPin('9999')).toBe(true);
    expect(verifyPin('2468')).toBe(false);
  });

  it('creates and verifies session tokens', () => {
    const token = createParentSessionToken();
    const ok = verifyParentSessionToken(token);
    expect(ok.ok).toBe(true);
    const bad = verifyParentSessionToken('not.a.token');
    expect(bad.ok).toBe(false);
  });
});

describe('parent-auth handler', () => {
  const prev = { ...process.env };

  beforeEach(() => {
    resetAllRateLimits();
    process.env.SESSION_SECRET = 'unit-test-secret';
    process.env.PARENT_PIN = '2468';
    delete process.env.PARENT_PIN_HASH;
  });

  afterEach(() => {
    process.env = { ...prev };
  });

  it('returns token for correct PIN', async () => {
    const res = await parentAuth({
      httpMethod: 'POST',
      body: JSON.stringify({ pin: '2468' }),
      queryStringParameters: null,
      headers: { 'x-forwarded-for': '10.0.0.1' },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { token: string };
    expect(body.token.split('.').length).toBe(2);
  });

  it('rejects wrong PIN with 401', async () => {
    const res = await parentAuth({
      httpMethod: 'POST',
      body: JSON.stringify({ pin: '1111' }),
      queryStringParameters: null,
      headers: { 'x-forwarded-for': '10.0.0.2' },
    });
    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body) as { error: { code: string } };
    expect(body.error.code).toBe('WRONG_PIN');
  });

  it('rate limits after 5 failures / 15 minutes', async () => {
    const ip = '10.0.0.3';
    for (let i = 0; i < 5; i++) {
      const res = await parentAuth({
        httpMethod: 'POST',
        body: JSON.stringify({ pin: '0000' }),
        queryStringParameters: null,
        headers: { 'x-forwarded-for': ip },
      });
      // first 5 wrong → 401 until lock engages on 5th or 6th
      expect([401, 429]).toContain(res.statusCode);
    }
    const locked = await parentAuth({
      httpMethod: 'POST',
      body: JSON.stringify({ pin: '0000' }),
      queryStringParameters: null,
      headers: { 'x-forwarded-for': ip },
    });
    expect(locked.statusCode).toBe(429);
  });
});

describe('admin-reward authorized update', () => {
  const prev = { ...process.env };

  beforeEach(() => {
    resetServerRepo();
    resetAllRateLimits();
    process.env.SESSION_SECRET = 'unit-test-secret';
    process.env.PARENT_PIN = '2468';
  });

  afterEach(() => {
    process.env = { ...prev };
  });

  it('rejects without session', async () => {
    const res = await adminReward({
      httpMethod: 'POST',
      body: JSON.stringify({
        participationReward: 'Pizza night',
        minimumQuests: 2,
      }),
      queryStringParameters: null,
      headers: {},
    });
    expect(res.statusCode).toBe(401);
  });

  it('updates reward with valid parent token', async () => {
    const login = await parentAuth({
      httpMethod: 'POST',
      body: JSON.stringify({ pin: '2468' }),
      queryStringParameters: null,
      headers: { 'x-forwarded-for': '10.0.0.9' },
    });
    const { token } = JSON.parse(login.body) as { token: string };

    const res = await adminReward({
      httpMethod: 'POST',
      body: JSON.stringify({
        participationReward: 'Beach picnic',
        championBonus: 'Extra scoop',
        minimumQuests: 3,
      }),
      queryStringParameters: null,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as {
      reward: { participationReward: string; minimumQuests: number };
    };
    expect(body.reward.participationReward).toBe('Beach picnic');
    expect(body.reward.minimumQuests).toBe(3);
  });
});
