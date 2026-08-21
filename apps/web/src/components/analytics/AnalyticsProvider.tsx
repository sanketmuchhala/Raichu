'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useReportWebVitals } from 'next/web-vitals';
import { analytics } from '../../lib/analytics';
import { useAuthStore } from '../../store/auth-store';

/**
 * Drop into layout.tsx once.
 *
 * Fires page_view on every route navigation, page_exit with time-on-page and
 * scroll depth when the page is left, and web_vitals for Core Web Vitals.
 * The user_id is attached whenever the auth store has a session.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const prevPath = useRef<string | null>(null);

  // Refs rather than state: these change on every scroll event and must not
  // re-render the whole tree.
  const enteredAt   = useRef<number>(Date.now());
  const maxScroll   = useRef<number>(0);
  const exitedFor   = useRef<string | null>(null);
  const userIdRef   = useRef<string | null>(null);

  userIdRef.current = user?.id ?? null;

  useReportWebVitals((metric) => {
    analytics.webVital({
      metric: metric.name,
      value: Math.round(metric.value * 1000) / 1000,
      rating: (metric as { rating?: string }).rating,
    });
  });

  /** Emit page_exit at most once per page visit. */
  const flushExit = useCallback((path: string | null) => {
    if (!path || exitedFor.current === path) return;
    exitedFor.current = path;

    analytics.pageExit(
      {
        time_on_page_ms: Date.now() - enteredAt.current,
        max_scroll_pct: maxScroll.current,
      },
      path,
      userIdRef.current,
    );
  }, []);

  // ── Route changes ────────────────────────────────────────────────────────
  useEffect(() => {
    // Skip if path hasn't actually changed (StrictMode double-fire guard)
    if (pathname === prevPath.current) return;

    // Close out the page being navigated away from before starting the new one.
    flushExit(prevPath.current);

    prevPath.current = pathname;
    enteredAt.current = Date.now();
    maxScroll.current = 0;
    exitedFor.current = null;

    analytics.page(pathname, user?.id ?? null);
  }, [pathname, user?.id, flushExit]);

  // ── Scroll depth ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      // A page shorter than the viewport is fully seen by definition.
      const pct = scrollable <= 0 ? 100 : ((window.scrollY / scrollable) * 100);
      const clamped = Math.min(100, Math.max(0, Math.round(pct)));
      if (clamped > maxScroll.current) maxScroll.current = clamped;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  // ── Leaving the tab or closing it ────────────────────────────────────────
  useEffect(() => {
    // pagehide is the reliable one on mobile Safari, where unload never fires.
    const onPageHide = () => flushExit(prevPath.current);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushExit(prevPath.current);
    };

    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [flushExit]);

  return null;
}
