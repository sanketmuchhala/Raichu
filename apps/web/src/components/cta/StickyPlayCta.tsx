'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { analytics } from '../../lib/analytics';
import { useAuthStore } from '../../store/auth-store';
import { PlayCta } from './PlayCta';

/**
 * A sticky call to action for long-form pages.
 *
 * Blog posts previously carried a single CTA at the very bottom of the article,
 * which only readers who finish ever see. This appears once someone is far
 * enough in to be genuinely interested, and can be dismissed so it never
 * becomes an obstacle.
 *
 * Shown on content pages only — the ones search traffic lands on. It is
 * suppressed inside the app itself (playing, lobby, auth, profile), where the
 * reader is already a user and a second persistent CTA would just be noise.
 */

const SHOW_AFTER_SCROLL_PCT = 25;
const DISMISS_KEY = '_raichu_cta_dismissed';

/** App routes where a "go play" prompt is redundant or intrusive. */
const EXCLUDED_PREFIXES = [
  '/play', '/game', '/lobby', '/join', '/auth', '/profile', '/history', '/admin',
];

function isContentRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return !EXCLUDED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function StickyPlayCta({ context = 'content' }: { context?: string }) {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true); // assume dismissed until storage is read

  // Respect a previous dismissal for the rest of the tab session.
  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  useEffect(() => {
    if (dismissed) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      // A page shorter than the viewport can never scroll; show right away.
      const pct = scrollable <= 0 ? 100 : (window.scrollY / scrollable) * 100;
      setVisible(pct >= SHOW_AFTER_SCROLL_PCT);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  if (!isContentRoute(pathname) || dismissed || !visible) return null;

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* non-fatal */ }
    analytics.custom('cta_dismissed', { context }, useAuthStore.getState().user?.id ?? null);
  };

  return (
    <div
      role="complementary"
      aria-label="Play Raichu"
      style={{
        position:        'fixed',
        bottom:          0,
        left:            0,
        right:           0,
        zIndex:          50,
        backgroundColor: theme.bgPanel,
        borderTop:       `1px solid ${theme.border}`,
        boxShadow:       '0 -2px 12px rgba(0,0,0,0.12)',
        padding:         '0.6875rem 1rem',
        // Keep clear of the iOS home indicator.
        paddingBottom:   'calc(0.6875rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div
        style={{
          maxWidth:   720,
          margin:     '0 auto',
          display:    'flex',
          alignItems: 'center',
          gap:        '0.75rem',
        }}
      >
        <span
          style={{
            color:      theme.textSecondary,
            fontSize:   '0.875rem',
            lineHeight: 1.4,
            flex:       1,
            minWidth:   0,
          }}
        >
          Free in your browser. No download, no account.
        </span>

        <PlayCta placement={`sticky-${context}`} label="Play Raichu" size="md" />

        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            background: 'none',
            border:     'none',
            cursor:     'pointer',
            color:      theme.textSecondary,
            padding:    '0.25rem',
            lineHeight: 0,
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M14 4L4 14M4 4L14 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
