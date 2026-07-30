import type { Player, WeeklyLeaderboard, WeeklyReward } from '@/types';
import { getClientMemoryRepo } from '@/repositories/memory';
import { weekId } from '@/lib/week';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const useFixture = import.meta.env.VITE_USE_FIXTURE_API !== 'false';

const SESSION_KEY = 'iq_parent_token';
const SESSION_FLAG = 'iq_parent_session';

export function getParentToken(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

export function setParentSession(token: string): void {
  sessionStorage.setItem(SESSION_KEY, token);
  sessionStorage.setItem(SESSION_FLAG, String(Date.now()));
}

export function clearParentSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_FLAG);
}

export function hasParentSession(): boolean {
  return Boolean(sessionStorage.getItem(SESSION_FLAG) || getParentToken());
}

async function parentRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = getParentToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data as { error?: { code?: string; message?: string } };
    throw Object.assign(new Error(err.error?.message ?? 'Request failed'), {
      code: err.error?.code ?? 'HTTP_ERROR',
      status: res.status,
    });
  }
  return data as T;
}

/** Local fixture PIN path mirrors server default for offline parent UI. */
const FIXTURE_PIN = '2468';

export async function parentLogin(pin: string): Promise<{ token: string }> {
  if (useFixture) {
    if (pin !== FIXTURE_PIN) {
      throw Object.assign(new Error('That PIN didn’t work.'), {
        code: 'WRONG_PIN',
        status: 401,
      });
    }
    const token = `fixture_${Date.now()}`;
    setParentSession(token);
    return { token };
  }
  const res = await parentRequest<{ token: string }>('/parent-auth', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });
  setParentSession(res.token);
  return res;
}

export async function fetchParentOverview(week?: string): Promise<{
  players: Player[];
  leaderboard: WeeklyLeaderboard;
  reward: WeeklyReward | null;
}> {
  const w = week || weekId();
  if (useFixture) {
    const repo = getClientMemoryRepo();
    const players = await repo.listPlayers();
    const leaderboard = await repo.getLeaderboard(w);
    let reward = await repo.getWeeklyReward(w);
    if (!reward) {
      reward = {
        id: `rw_${w}`,
        weekId: w,
        participationReward: 'Family movie night pick',
        championBonus: 'Extra beach ice cream',
        minimumQuests: 1,
        enabled: true,
        updatedAt: new Date().toISOString(),
      };
      await repo.upsertWeeklyReward(reward);
    }
    return { players, leaderboard, reward };
  }

  const [playersRes, boardRes, rewardRes] = await Promise.all([
    parentRequest<{ players: Player[] }>('/players'),
    parentRequest<{ leaderboard: WeeklyLeaderboard }>(
      `/leaderboard?week=${encodeURIComponent(w)}`,
    ),
    parentRequest<{ reward: WeeklyReward | null }>(
      `/rewards?week=${encodeURIComponent(w)}`,
    ),
  ]);
  return {
    players: playersRes.players,
    leaderboard: boardRes.leaderboard,
    reward: rewardRes.reward,
  };
}

export async function adminUpdateReward(input: {
  weekId?: string;
  participationReward: string;
  championBonus?: string;
  minimumQuests: number;
  enabled?: boolean;
}): Promise<WeeklyReward> {
  if (useFixture) {
    if (!hasParentSession()) {
      throw Object.assign(new Error('Parent session required.'), {
        code: 'UNAUTHORIZED',
        status: 401,
      });
    }
    const w = input.weekId || weekId();
    const reward: WeeklyReward = {
      id: `rw_${w}`,
      weekId: w,
      participationReward: input.participationReward,
      championBonus: input.championBonus,
      minimumQuests: input.minimumQuests,
      enabled: input.enabled !== false,
      updatedAt: new Date().toISOString(),
    };
    await getClientMemoryRepo().upsertWeeklyReward(reward);
    return reward;
  }
  const res = await parentRequest<{ reward: WeeklyReward }>('/admin-reward', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return res.reward;
}

export async function adminUpdatePlayer(input: {
  playerId: string;
  displayName?: string;
  difficultyLevel?: 1 | 2 | 3 | 4;
  enabled?: boolean;
}): Promise<Player> {
  if (useFixture) {
    if (!hasParentSession()) {
      throw Object.assign(new Error('Parent session required.'), {
        code: 'UNAUTHORIZED',
        status: 401,
      });
    }
    return getClientMemoryRepo().updatePlayer(input.playerId, input);
  }
  const res = await parentRequest<{ player: Player }>('/admin-player', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return res.player;
}

export async function adminBonusPoints(input: {
  playerId: string;
  points: number;
  reason?: string;
  weekId?: string;
}): Promise<void> {
  if (useFixture) {
    if (!hasParentSession()) {
      throw Object.assign(new Error('Parent session required.'), {
        code: 'UNAUTHORIZED',
        status: 401,
      });
    }
    const repo = getClientMemoryRepo();
    await repo.addBonusPoints({
      playerId: input.playerId,
      weekId: input.weekId || weekId(),
      points: input.points,
      reason: input.reason,
    });
    return;
  }
  await parentRequest('/admin-bonus-points', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function adminResetWeek(week?: string): Promise<void> {
  if (useFixture) {
    if (!hasParentSession()) {
      throw Object.assign(new Error('Parent session required.'), {
        code: 'UNAUTHORIZED',
        status: 401,
      });
    }
    await getClientMemoryRepo().resetWeekLeaderboard(week || weekId());
    return;
  }
  await parentRequest('/admin-reset-week', {
    method: 'POST',
    body: JSON.stringify({ weekId: week, confirm: true }),
  });
}
