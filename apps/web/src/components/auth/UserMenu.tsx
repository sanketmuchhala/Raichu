'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/auth-store';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';

export function UserMenu() {
  const theme   = useUIStore((s) => THEMES[s.theme]);
  const user    = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const initialized = useAuthStore((s) => s.initialized);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!initialized) return null;

  if (!user) {
    return (
      <Link
        href="/auth"
        className="px-4 py-2 min-h-[44px] inline-flex items-center rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: theme.accent, color: '#fff' }}
      >
        Sign In
      </Link>
    );
  }

  const displayName = profile?.display_name || profile?.username || 'Player';
  const initial     = displayName[0].toUpperCase();
  const elo         = profile?.elo_rating ?? 1200;

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg text-sm transition-opacity hover:opacity-80"
        style={{
          padding: '0.375rem 0.625rem 0.375rem 0.375rem',
          backgroundColor: theme.bgSecondary,
          border: `1px solid ${theme.border}`,
          color: theme.textPrimary,
        }}
      >
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
          style={{ backgroundColor: theme.accent, color: '#fff' }}
        >
          {initial}
        </span>
        <span className="hidden sm:inline font-medium">{displayName}</span>
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ color: theme.textSecondary, marginLeft: 2, transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1.5 w-52 rounded-xl overflow-hidden shadow-xl z-50 animate-fade-in"
          style={{
            backgroundColor: theme.bgPanel,
            border: `1px solid ${theme.border}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
          }}
        >
          {/* User info header */}
          <div
            className="px-4 py-3"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: theme.accent + '22', color: theme.accent }}
              >
                {initial}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: theme.textPrimary }}>
                  {displayName}
                </p>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  {elo} ELO
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
              style={{ color: theme.textSecondary }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.25"/>
                <path d="M2 12c0-2.21 2.24-4 5-4s5 1.79 5 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
              </svg>
              Profile
            </Link>
            <Link
              href="/history"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:opacity-80"
              style={{ color: theme.textSecondary }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.25"/>
                <path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Game History
            </Link>
          </div>

          <div style={{ borderTop: `1px solid ${theme.border}` }} className="py-1">
            <button
              onClick={() => { setOpen(false); signOut(); }}
              className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm transition-colors hover:opacity-80"
              style={{ color: '#ef4444' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 12H3a1 1 0 01-1-1V3a1 1 0 011-1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
