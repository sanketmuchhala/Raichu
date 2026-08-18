import { randomUUID } from 'crypto';
import { supabaseAdmin, isSupabaseConfigured } from './supabase';

/**
 * Server-side analytics.
 *
 * The browser can only report what it believes happened. These events record
 * what the server actually did — authoritative game outcomes, real ELO deltas,
 * true matchmaking latency — and cannot be blocked by an ad blocker or lost to
 * a closed tab mid-game.
 *
 * Rows are tagged `app = 'api'` so they are distinguishable from browser events
 * (see migration 006, which also excludes them from the session-based views —
 * a server event has no browser session and would otherwise inflate DAU).
 *
 * Every call is fire-and-forget. Analytics must never fail a game request.
 */

type ServerEvent =
  | 'server_game_created'
  | 'server_game_finished'
  | 'server_match_made'
  | 'server_error';

export function trackServerEvent(
  eventType: ServerEvent,
  properties: Record<string, unknown>,
  userId?: string | null,
): void {
  if (!isSupabaseConfigured) return;

  void supabaseAdmin
    .from('analytics_events')
    .insert({
      // Server events have no browser session; a fresh id keeps the NOT NULL
      // constraint satisfied without pretending to be a real session.
      session_id: randomUUID(),
      user_id: userId ?? null,
      event_type: eventType,
      app: 'api',
      properties,
    })
    .then(({ error }) => {
      if (error) console.error('[analytics] server insert failed:', error.message);
    });
}
