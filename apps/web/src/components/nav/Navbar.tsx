'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { UserMenu } from '../auth/UserMenu';
import { useAuthStore } from '../../store/auth-store';
import { PlayCta } from '../cta/PlayCta';

const BASE_LINKS = [
  { href: '/lobby',       label: 'Online'      },
  { href: '/rules',       label: 'Rules'       },
  { href: '/how-to-play', label: 'How to Play' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/blog',        label: 'Blog'        },
];

const AUTH_LINKS = [
  { href: '/history', label: 'History' },
];

interface NavbarProps {
  /** Show a back arrow on the left side (e.g. game pages) */
  backHref?:  string;
  backLabel?: string;
  /** Use the focused, low-chrome navigation shown above a live board. */
  gameMode?: boolean;
}

export function Navbar({ backHref, backLabel, gameMode = false }: NavbarProps) {
  const theme    = useUIStore((s) => THEMES[s.theme]);
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);

  const NAV_LINKS = user ? [...BASE_LINKS, ...AUTH_LINKS] : BASE_LINKS;

  // Close mobile menu when navigating
  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <header
      className={`site-navbar sticky top-0 z-40${gameMode ? ' game-navbar' : ''}`}
      style={{ backgroundColor: theme.bgPanel, borderBottom: `1px solid ${theme.border}` }}
    >
      <div
        className="navbar-inner max-w-6xl mx-auto px-4"
        style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}
      >

        {/* ── Left: back arrow (optional) + logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {gameMode && (
            <Link
              href="/"
              className="game-nav-back md:hidden"
              aria-label="Back to home"
              style={{ color: theme.textSecondary }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M11.5 14L6.5 9L11.5 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}
          {backHref && (
            <Link
              href={backHref}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: theme.accent, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden sm:inline">{backLabel ?? 'Back'}</span>
            </Link>
          )}
          <Link
            href="/"
            style={{ fontWeight: 700, fontSize: '1.125rem', color: theme.textPrimary, textDecoration: 'none', letterSpacing: '-0.01em' }}
          >
            Raichu
          </Link>
        </div>

        {/* ── Center: desktop nav links ── */}
        <nav
          className="hidden md:flex items-center"
          style={{ gap: '0.125rem', flex: 1, justifyContent: 'center' }}
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  color:           active ? theme.accent : theme.textSecondary,
                  backgroundColor: active ? `${theme.accent}18` : 'transparent',
                  padding:         '0.375rem 0.6875rem',
                  borderRadius:    6,
                  fontSize:        '0.875rem',
                  fontWeight:      active ? 600 : 400,
                  textDecoration:  'none',
                  whiteSpace:      'nowrap',
                  transition:      'color 0.12s ease, background-color 0.12s ease',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = theme.textPrimary; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = theme.textSecondary; }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right: UserMenu + hamburger ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {/* Hidden below md: at 320px the bar overflowed, and StickyPlayCta
              plus the mobile menu already offer the same action. */}
          {pathname !== '/play' && (
            <span className="hidden md:inline-flex">
              <PlayCta placement="navbar" size="sm" />
            </span>
          )}
          <div className={gameMode ? 'hidden md:block' : undefined}>
            <UserMenu />
          </div>
          <button
            className="grid md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
            style={{ width: 44, height: 44, placeItems: 'center', borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, lineHeight: 0 }}
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M14 4L4 14M4 4L14 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {open && (
        <nav
          className="md:hidden"
          style={{ backgroundColor: theme.bgPanel, borderTop: `1px solid ${theme.border}`, padding: '0.375rem 0.75rem 0.75rem' }}
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  minHeight:      44,
                  padding:        '0.625rem 0.75rem',
                  borderRadius:   6,
                  fontSize:       '0.9375rem',
                  fontWeight:     active ? 600 : 400,
                  color:          active ? theme.accent : theme.textSecondary,
                  textDecoration: 'none',
                  marginBottom:   '0.125rem',
                }}
              >
                {label}
              </Link>
            );
          })}
          {!user && gameMode && (
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="mobile-nav-signin"
              style={{ color: theme.textPrimary, borderColor: theme.border }}
            >
              Sign in or create an account
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
