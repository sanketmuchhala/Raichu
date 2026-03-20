'use client';

import { create } from 'zustand';
import { apiFetch } from '../lib/api';

type MatchmakingStatus = 'idle' | 'queued' | 'matched';

interface MatchmakingStore {
  status: MatchmakingStatus;
  waitSeconds: number;
  queueCount: number;
  matchedGameId: string | null;
  error: string | null;
  _idleRetries: number;

  joinQueue: () => Promise<void>;
  leaveQueue: () => Promise<void>;
  pollStatus: () => Promise<void>;
  reset: () => void;
}

export const useMatchmakingStore = create<MatchmakingStore>((set, get) => ({
  status: 'idle',
  waitSeconds: 0,
  queueCount: 0,
  matchedGameId: null,
  error: null,
  _idleRetries: 0,

  joinQueue: async () => {
    try {
      const data = (await apiFetch('/api/v1/matchmaking/queue', { method: 'POST' })) as {
        queueCount?: number;
      };
      set({
        status: 'queued',
        waitSeconds: 0,
        queueCount: data.queueCount ?? 0,
        error: null,
        matchedGameId: null,
        _idleRetries: 0,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to join queue' });
    }
  },

  leaveQueue: async () => {
    try {
      await apiFetch('/api/v1/matchmaking/queue', { method: 'DELETE' });
      set({ status: 'idle', waitSeconds: 0, queueCount: 0, matchedGameId: null, _idleRetries: 0 });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to leave queue' });
    }
  },

  pollStatus: async () => {
    if (get().status !== 'queued') return;
    try {
      const data = (await apiFetch('/api/v1/matchmaking/status')) as {
        status: MatchmakingStatus;
        waitSeconds?: number;
        queueCount?: number;
        gameId?: string;
      };

      if (data.status === 'matched' && data.gameId) {
        set({ status: 'matched', matchedGameId: data.gameId, _idleRetries: 0 });
      } else if (data.status === 'queued') {
        set({
          waitSeconds: data.waitSeconds || 0,
          queueCount: data.queueCount ?? get().queueCount,
          _idleRetries: 0,
        });
      } else {
        // Status returned 'idle' — might be a race condition between
        // queue removal and game creation. Don't immediately stop polling.
        const retries = get()._idleRetries + 1;
        if (retries >= 3) {
          // 3 consecutive idle responses (9s) — actually idle
          set({ status: 'idle', _idleRetries: 0 });
        } else {
          set({ _idleRetries: retries });
        }
      }
    } catch {
      // Silently fail individual polls
    }
  },

  reset: () => {
    set({ status: 'idle', waitSeconds: 0, queueCount: 0, matchedGameId: null, error: null, _idleRetries: 0 });
  },
}));
