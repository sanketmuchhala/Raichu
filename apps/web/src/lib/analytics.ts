'use client';

// ─── Session ID ────────────────────────────────────────────────────────────
// One UUID per browser tab session (cleared when tab closes).

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function getSessionId(): string {
  if (typeof sessionStorage === 'undefined') return 'ssr';
  let id = sessionStorage.getItem('_rsid');
  if (!id) {
    id = generateUUID();
    sessionStorage.setItem('_rsid', id);
  }
  return id;
}

// ─── Sampling ──────────────────────────────────────────────────────────────
// page_exit and web_vitals fire on essentially every pageview. Everything is at
// 100% while volume is low; turn these down here rather than at the call sites
// if analytics_events starts approaching the 500 MB free-tier limit.

const SAMPLE_RATES: Record<string, number> = {
  web_vitals: 1,
  page_exit: 1,
};

function shouldSample(eventType: string): boolean {
  const rate = SAMPLE_RATES[eventType] ?? 1;
  return rate >= 1 || Math.random() < rate;
}

// ─── Payload type ──────────────────────────────────────────────────────────

export interface TrackPayload {
  event_type:  string;
  page?:       string;
  referrer?:   string;
  properties?: Record<string, unknown>;
  user_id?:    string | null;
}

// ─── Core track function ───────────────────────────────────────────────────
// Fire-and-forget: never throws, never blocks the UI.

export function trackEvent(payload: TrackPayload): void {
  if (typeof window === 'undefined') return;
  if (!shouldSample(payload.event_type)) return;

  const data = {
    session_id:          getSessionId(),
    user_id:             payload.user_id ?? null,
    event_type:          payload.event_type,
    page:                payload.page ?? window.location.pathname,
    referrer:            payload.referrer ?? (document.referrer || null),
    screen_width:        window.screen?.width ?? null,
    screen_height:       window.screen?.height ?? null,
    viewport_width:      window.innerWidth ?? null,
    viewport_height:     window.innerHeight ?? null,
    device_pixel_ratio:  window.devicePixelRatio ?? null,
    language:            navigator?.language ?? null,
    timezone:            Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone ?? null,
    properties:          payload.properties ?? null,
  };

  // Use sendBeacon when available (survives page unload)
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/track', blob);
  } else {
    fetch('/api/track', { method: 'POST', body: JSON.stringify(data), keepalive: true,
      headers: { 'content-type': 'application/json' } }).catch(() => {});
  }
}

// ─── Play-style summary ────────────────────────────────────────────────────
// Offline and bot games never reach the `moves` table, so their move data
// exists nowhere else. Rather than one event per move (~40x the rows for the
// same information), each finished offline game emits a single summary.
// Online games are derived from `moves` in SQL instead — see migration 006.

export type GameSummary = {
  mode:              string;
  difficulty?:       string;
  playerColor?:      string;
  status:            string;
  moveCount:         number;
  durationMs:        number;
  capturesFor:       number;
  capturesAgainst:   number;
  promotions:        number;
  thinkMsP50:        number | null;
  thinkMsP90:        number | null;
  advancementBias:   number | null;
  pieceUsage:        Record<string, number>;
};

// ─── Typed helpers ─────────────────────────────────────────────────────────

export const analytics = {
  page: (path: string, userId?: string | null) =>
    trackEvent({ event_type: 'page_view', page: path, user_id: userId }),

  gameStarted: (props: { mode: string; difficulty?: string; playerColor?: string }, userId?: string | null) =>
    trackEvent({ event_type: 'game_started', properties: props, user_id: userId }),

  gameEnded: (props: { mode: string; status: string; moveCount: number; duration_ms?: number }, userId?: string | null) =>
    trackEvent({ event_type: 'game_ended', properties: props, user_id: userId }),

  /** Rich per-game play-style payload for offline/bot games. */
  gameSummary: (props: GameSummary, userId?: string | null) =>
    trackEvent({ event_type: 'game_summary', properties: props, user_id: userId }),

  matchFound: (props: { gameType: string; eloRating?: number; waitSeconds?: number }, userId?: string | null) =>
    trackEvent({ event_type: 'match_found', properties: props, user_id: userId }),

  login: (userId: string) =>
    trackEvent({ event_type: 'login', user_id: userId }),

  signup: (userId: string) =>
    trackEvent({ event_type: 'signup', user_id: userId }),

  logout: (userId?: string | null) =>
    trackEvent({ event_type: 'logout', user_id: userId }),

  replayViewed: (props: { gameId: string; moveCount: number }, userId?: string | null) =>
    trackEvent({ event_type: 'replay_viewed', properties: props, user_id: userId }),

  boardFlipped: (userId?: string | null) =>
    trackEvent({ event_type: 'board_flipped', user_id: userId }),

  // ── Online multiplayer ───────────────────────────────────────────────────

  onlineGameStarted: (props: { gameId: string; gameType: string; myColor: string }, userId?: string | null) =>
    trackEvent({ event_type: 'online_game_started', properties: props, user_id: userId }),

  onlineGameEnded: (
    props: {
      gameId: string; gameType: string; status: string; myColor: string;
      won: boolean; moveCount: number; durationMs?: number; eloDelta?: number | null;
    },
    userId?: string | null,
  ) => trackEvent({ event_type: 'online_game_ended', properties: props, user_id: userId }),

  onlineResigned: (props: { gameId: string; moveCount: number }, userId?: string | null) =>
    trackEvent({ event_type: 'online_resigned', properties: props, user_id: userId }),

  /**
   * Realtime health. `viaPolling` means the 3s REST fallback in
   * use-game-subscription.ts had to carry the game because the websocket
   * was not connected — a direct measure of Supabase Realtime quality.
   */
  realtimeStatus: (props: { gameId: string; status: string; viaPolling?: boolean }, userId?: string | null) =>
    trackEvent({
      event_type: props.status === 'SUBSCRIBED' ? 'realtime_connected' : 'realtime_lost',
      properties: props,
      user_id: userId,
    }),

  // ── Funnel ───────────────────────────────────────────────────────────────

  lobbyViewed: (userId?: string | null) =>
    trackEvent({ event_type: 'lobby_viewed', user_id: userId }),

  gameCreated: (props: { gameType: string; difficulty?: string; playAs?: string }, userId?: string | null) =>
    trackEvent({ event_type: 'game_created', properties: props, user_id: userId }),

  inviteCopied: (props: { gameId: string }, userId?: string | null) =>
    trackEvent({ event_type: 'invite_copied', properties: props, user_id: userId }),

  joinAttempted: (props: { code: string }, userId?: string | null) =>
    trackEvent({ event_type: 'join_attempted', properties: props, user_id: userId }),

  joinFailed: (props: { code: string; reason: string }, userId?: string | null) =>
    trackEvent({ event_type: 'join_failed', properties: props, user_id: userId }),

  matchmakingQueued: (props: { eloRating?: number }, userId?: string | null) =>
    trackEvent({ event_type: 'matchmaking_queued', properties: props, user_id: userId }),

  matchmakingCancelled: (props: { waitSeconds: number }, userId?: string | null) =>
    trackEvent({ event_type: 'matchmaking_cancelled', properties: props, user_id: userId }),

  // ── Engagement ───────────────────────────────────────────────────────────

  pageExit: (props: { time_on_page_ms: number; max_scroll_pct: number }, path?: string, userId?: string | null) =>
    trackEvent({ event_type: 'page_exit', page: path, properties: props, user_id: userId }),

  ctaClick: (props: { target: string; label?: string }, userId?: string | null) =>
    trackEvent({ event_type: 'cta_click', properties: props, user_id: userId }),

  outboundClick: (props: { href: string }, userId?: string | null) =>
    trackEvent({ event_type: 'outbound_click', properties: props, user_id: userId }),

  // ── Errors and performance ───────────────────────────────────────────────

  apiError: (props: { path: string; status?: number; reason: string }, userId?: string | null) =>
    trackEvent({ event_type: 'api_error', properties: props, user_id: userId }),

  authError: (props: { action: string; reason: string }) =>
    trackEvent({ event_type: 'auth_error', properties: props }),

  invalidMove: (props: { mode: string; reason: string }, userId?: string | null) =>
    trackEvent({ event_type: 'invalid_move_rejected', properties: props, user_id: userId }),

  webVital: (props: { metric: string; value: number; rating?: string }) =>
    trackEvent({ event_type: 'web_vitals', properties: props }),

  botMoveLatency: (props: { difficulty: string; ms: number; nodes?: number }) =>
    trackEvent({ event_type: 'bot_move_latency', properties: props }),

  custom: (eventType: string, properties?: Record<string, unknown>, userId?: string | null) =>
    trackEvent({ event_type: eventType, properties, user_id: userId }),
};
