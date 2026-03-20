'use client';

import { useEffect, useRef } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './client';
import { useOnlineGameStore } from '../../store/online-game-store';
import { gamesApi } from '../api';
import type { OnlineGameDetail } from '@raichu/shared-types';

const POLL_INTERVAL = 3000;

/** Subscribe to Realtime changes for a specific game, with polling fallback */
export function useGameSubscription(gameId: string | null) {
  const handleGameUpdate = useOnlineGameStore((s) => s.handleGameUpdate);
  const handleNewMove = useOnlineGameStore((s) => s.handleNewMove);
  const realtimeConnected = useRef(false);

  // Primary: Supabase Realtime subscription
  useEffect(() => {
    if (!gameId) return;

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          realtimeConnected.current = true;
          handleGameUpdate(payload.new as Parameters<typeof handleGameUpdate>[0]);
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'moves', filter: `game_id=eq.${gameId}` },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          realtimeConnected.current = true;
          handleNewMove(payload.new as Parameters<typeof handleNewMove>[0]);
        },
      )
      .subscribe((status: string) => {
        realtimeConnected.current = status === 'SUBSCRIBED';
      });

    return () => {
      supabase.removeChannel(channel);
      realtimeConnected.current = false;
    };
  }, [gameId, handleGameUpdate, handleNewMove]);

  // Fallback: poll for game updates when Realtime isn't delivering
  useEffect(() => {
    if (!gameId) return;

    const poll = async () => {
      // Skip polling if Realtime is actively working
      if (realtimeConnected.current) {
        const { game } = useOnlineGameStore.getState();
        // Still poll occasionally even with Realtime as a safety net,
        // but only if the game is actively being played
        if (game?.status !== 'playing') return;
      }

      try {
        const game = (await gamesApi.get(gameId)) as OnlineGameDetail;
        const storeGame = useOnlineGameStore.getState().game;
        // Only update if board state actually changed
        if (storeGame && game.board_state !== storeGame.board_state) {
          handleGameUpdate(game);
        }
        // Also update if status changed (e.g. game ended)
        if (storeGame && game.status !== storeGame.status) {
          handleGameUpdate(game);
        }
      } catch {
        // Silently fail polls
      }
    };

    const intervalId = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [gameId, handleGameUpdate]);
}
