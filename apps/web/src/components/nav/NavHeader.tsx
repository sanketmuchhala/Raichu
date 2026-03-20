'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { UserMenu } from '../auth/UserMenu';

interface NavHeaderProps {
  title?: string;
  backHref?: string;
  backLabel?: string;
}

const NAV_LINKS = [
  { href: '/lobby', label: 'Lobby' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/history', label: 'History' },
];

export function NavHeader({ title, backHref, backLabel }: NavHeaderProps) {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-40 px-4 py-3"
      style={{
        backgroundColor: theme.bgPanel,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Left: back arrow + title */}
        <div className="flex items-center gap-3 min-w-0">
          {backHref && (
            <Link
              href={backHref}
              className="flex items-center gap-1 text-sm shrink-0 hover:opacity-80 transition-opacity"
              style={{ color: theme.accent }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">{backLabel || 'Back'}</span>
            </Link>
          )}
          {title && (
            <h1
              className="text-lg font-bold truncate"
              style={{ color: theme.textPrimary }}
            >
              {title}
            </h1>
          )}
        </div>

        {/* Right: nav links + user menu */}
        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  style={{
                    color: isActive ? theme.accent : theme.textSecondary,
                    backgroundColor: isActive ? `${theme.accent}15` : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
