import type {
  CompletedRoundResult,
  Player,
  Round,
  RoundMode,
  WeeklyLeaderboard,
  WeeklyReward,
} from '@/types';
import type { AttemptInput } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
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

export const httpApi = {
  health: () => request<{ ok: boolean }>('/health'),
  players: () => request<{ players: Player[] }>('/players'),
  player: (id: string) => request<{ player: Player }>(`/player?id=${encodeURIComponent(id)}`),
  leaderboard: (week?: string) =>
    request<{ leaderboard: WeeklyLeaderboard }>(
      `/leaderboard${week ? `?week=${encodeURIComponent(week)}` : ''}`,
    ),
  rewards: (week?: string) =>
    request<{ reward: WeeklyReward | null }>(
      `/rewards${week ? `?week=${encodeURIComponent(week)}` : ''}`,
    ),
  startRound: (body: { playerId: string; mode: RoundMode; worldId?: string }) =>
    request<{ round: Round; questions: import('@/types').Question[] }>('/start-round', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  completeRound: (body: {
    roundId: string;
    playerId: string;
    attempts: AttemptInput[];
    clientCompletedAt: string;
  }) =>
    request<{ result: CompletedRoundResult }>('/complete-round', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
