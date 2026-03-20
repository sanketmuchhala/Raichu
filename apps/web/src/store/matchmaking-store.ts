'use client';

import { create } from 'zustand';
import { apiFetch } from '../lib/api';

type MatchmakingStatus = 'idle' | 'queued' | 'matched';

interface MatchmakingStore {
  status: MatchmakingStatus;
  waitSeconds: number;
  matchedGameId: string | null;
  error: string | null;

  joinQueue: () => Promise<void>;
  leaveQueue: () => Promise<void>;
  pollStatus: () => Promise<void>;
  reset: () => void;
}

export const useMatchmakingStore = create<MatchmakingStore>((set, get) => ({
  status: 'idle',
  waitSeconds: 0,
  matchedGameId: null,
  error: null,

  joinQueue: async () => {
    try {
      await apiFetch('/api/v1/matchmaking/queue', { method: 'POST' });
      set({ status: 'queued', waitSeconds: 0, error: null, matchedGameId: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to join queue' });
    }
  },

  leaveQueue: async () => {
    try {
      await apiFetch('/api/v1/matchmaking/queue', { method: 'DELETE' });
      set({ status: 'idle', waitSeconds: 0, matchedGameId: null });
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
        gameId?: string;
      };

      if (data.status === 'matched' && data.gameId) {
        set({ status: 'matched', matchedGameId: data.gameId });
      } else if (data.status === 'queued') {
        set({ waitSeconds: data.waitSeconds || 0 });
      } else {
        set({ status: 'idle' });
      }
    } catch {
      // Silently fail polling
    }
  },

  reset: () => {
    set({ status: 'idle', waitSeconds: 0, matchedGameId: null, error: null });
  },
}));
