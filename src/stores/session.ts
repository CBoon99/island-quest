import { create } from 'zustand';
import type {
  AttemptInput,
  CompletedRoundResult,
  Player,
  PowerUpId,
  Question,
  Round,
  RoundMode,
} from '@/types';
import {
  getActivePlayerId,
  setActivePlayerId,
  cacheLocalResults,
  enqueuePendingCompletion,
  type SyncStatus,
} from '@/repositories/local';
import { getClientMemoryRepo } from '@/repositories/memory';
import { completeRoundVerified, startRound } from '@/features/game/gameService';
import { httpApi } from '@/repositories/http';

const useFixture = import.meta.env.VITE_USE_FIXTURE_API !== 'false';

type SessionState = {
  players: Player[];
  activePlayerId: string | null;
  loading: boolean;
  round: Round | null;
  questions: Question[];
  attemptLog: AttemptInput[];
  questionIndex: number;
  provisionalScore: number;
  streakInRound: number;
  powerUpsRemaining: Partial<Record<PowerUpId, number>>;
  lastResult: CompletedRoundResult | null;
  syncStatus: SyncStatus;
  loadPlayers: () => Promise<void>;
  selectPlayer: (id: string) => void;
  getActivePlayer: () => Player | null;
  beginRound: (mode: RoundMode, worldId?: string) => Promise<void>;
  consumePowerUp: (id: PowerUpId) => boolean;
  recordAttempt: (attempt: AttemptInput) => void;
  advanceQuestion: () => void;
  finishRound: () => Promise<CompletedRoundResult | null>;
  clearRound: () => void;
};

export const useSession = create<SessionState>((set, get) => ({
  players: [],
  activePlayerId: getActivePlayerId(),
  loading: false,
  round: null,
  questions: [],
  attemptLog: [],
  questionIndex: 0,
  provisionalScore: 0,
  streakInRound: 0,
  powerUpsRemaining: {},
  lastResult: null,
  syncStatus: 'idle',

  loadPlayers: async () => {
    set({ loading: true });
    try {
      if (useFixture) {
        const players = await getClientMemoryRepo().listPlayers();
        set({ players, loading: false });
      } else {
        const { players } = await httpApi.players();
        set({ players, loading: false });
      }
    } catch {
      const players = await getClientMemoryRepo().listPlayers();
      set({ players, loading: false });
    }
  },

  selectPlayer: (id) => {
    setActivePlayerId(id);
    set({ activePlayerId: id });
  },

  getActivePlayer: () => {
    const { players, activePlayerId } = get();
    return players.find((p) => p.id === activePlayerId) ?? null;
  },

  beginRound: async (mode, worldId) => {
    const playerId = get().activePlayerId;
    if (!playerId) throw new Error('No player');
    set({ loading: true });
    try {
      let round: Round;
      let questions: Question[];
      if (useFixture) {
        const res = await startRound(getClientMemoryRepo(), {
          playerId,
          mode,
          worldId,
        });
        round = res.round;
        questions = res.questions;
      } else {
        const res = await httpApi.startRound({ playerId, mode, worldId });
        round = res.round;
        questions = res.questions;
      }
      set({
        round,
        questions,
        attemptLog: [],
        questionIndex: 0,
        provisionalScore: 0,
        streakInRound: 0,
        powerUpsRemaining: { ...round.powerUpsRemaining },
        lastResult: null,
        syncStatus: 'idle',
        loading: false,
      });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  consumePowerUp: (id) => {
    const remaining = get().powerUpsRemaining;
    const count = remaining[id] ?? 0;
    if (count <= 0) return false;
    set({
      powerUpsRemaining: { ...remaining, [id]: count - 1 },
    });
    return true;
  },

  recordAttempt: (attempt) => {
    set((s) => ({
      attemptLog: [...s.attemptLog, attempt],
    }));
  },

  advanceQuestion: () => {
    set((s) => ({ questionIndex: s.questionIndex + 1 }));
  },

  finishRound: async () => {
    const { round, attemptLog, activePlayerId } = get();
    if (!round || !activePlayerId) return null;

    set({ syncStatus: 'saving' });
    const payload = {
      roundId: round.id,
      playerId: activePlayerId,
      attempts: attemptLog,
      clientCompletedAt: new Date().toISOString(),
      // adversarial noise — server must ignore
      score: 999999,
      xp: 999999,
      coins: 999999,
      weeklyPoints: 999999,
    };

    try {
      let result: CompletedRoundResult;
      if (useFixture) {
        result = await completeRoundVerified(getClientMemoryRepo(), {
          roundId: payload.roundId,
          playerId: payload.playerId,
          attempts: payload.attempts,
        });
      } else {
        const res = await httpApi.completeRound(payload);
        result = res.result;
      }
      cacheLocalResults({ result, verified: true, syncStatus: 'saved' });
      set({ lastResult: result, syncStatus: 'saved', round: result.round });
      await get().loadPlayers();
      return result;
    } catch {
      enqueuePendingCompletion({
        roundId: payload.roundId,
        playerId: payload.playerId,
        attempts: payload.attempts,
        clientCompletedAt: payload.clientCompletedAt,
        queuedAt: new Date().toISOString(),
      });
      set({ syncStatus: 'pending' });
      // Do not invent leaderboard rank — no fake verified result
      return null;
    }
  },

  clearRound: () => {
    set({
      round: null,
      questions: [],
      attemptLog: [],
      questionIndex: 0,
      provisionalScore: 0,
      streakInRound: 0,
      powerUpsRemaining: {},
    });
  },
}));
