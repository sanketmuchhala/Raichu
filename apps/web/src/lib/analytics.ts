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

// ─── Typed helpers ─────────────────────────────────────────────────────────

export const analytics = {
  page: (path: string, userId?: string | null) =>
    trackEvent({ event_type: 'page_view', page: path, user_id: userId }),

  gameStarted: (props: { mode: string; difficulty?: string; playerColor?: string }, userId?: string | null) =>
    trackEvent({ event_type: 'game_started', properties: props, user_id: userId }),

  gameEnded: (props: { mode: string; status: string; moveCount: number; duration_ms?: number }, userId?: string | null) =>
    trackEvent({ event_type: 'game_ended', properties: props, user_id: userId }),

  matchFound: (props: { gameType: string; eloRating?: number }, userId?: string | null) =>
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

  custom: (eventType: string, properties?: Record<string, unknown>, userId?: string | null) =>
    trackEvent({ event_type: eventType, properties, user_id: userId }),
};
