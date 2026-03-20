'use client';

import { useEffect } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './client';
import { useOnlineGameStore } from '../../store/online-game-store';

/** Subscribe to Realtime changes for a specific game */
export function useGameSubscription(gameId: string | null) {
  const handleGameUpdate = useOnlineGameStore((s) => s.handleGameUpdate);
  const handleNewMove = useOnlineGameStore((s) => s.handleNewMove);

  useEffect(() => {
    if (!gameId) return;

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          handleGameUpdate(payload.new as Parameters<typeof handleGameUpdate>[0]);
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'moves', filter: `game_id=eq.${gameId}` },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          handleNewMove(payload.new as Parameters<typeof handleNewMove>[0]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, handleGameUpdate, handleNewMove]);
}
