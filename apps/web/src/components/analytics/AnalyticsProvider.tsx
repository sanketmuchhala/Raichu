'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '../../lib/analytics';
import { useAuthStore } from '../../store/auth-store';

/**
 * Drop into layout.tsx once.
 * Fires a page_view event on every route navigation automatically.
 * The user_id is attached whenever the auth store has a session.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    // Skip if path hasn't actually changed (StrictMode double-fire guard)
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    analytics.page(pathname, user?.id ?? null);
  }, [pathname, user?.id]);

  return null;
}
