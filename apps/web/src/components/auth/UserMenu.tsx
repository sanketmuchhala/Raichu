'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/auth-store';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';

export function UserMenu() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const initialized = useAuthStore((s) => s.initialized);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!initialized) return null;

  if (!user) {
    return (
      <Link
        href="/auth"
        className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
        style={{ backgroundColor: theme.accent, color: '#fff' }}
      >
        Sign In
      </Link>
    );
  }

  const displayName = profile?.display_name || profile?.username || 'User';
  const initial = displayName[0].toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-opacity hover:opacity-80"
        style={{ backgroundColor: theme.bgSecondary, color: theme.textPrimary }}
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: theme.accent, color: '#fff' }}
        >
          {initial}
        </span>
        <span className="hidden sm:inline">{displayName}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-lg py-1 shadow-lg z-50"
          style={{
            backgroundColor: theme.bgPanel,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="px-3 py-2 border-b" style={{ borderColor: theme.border }}>
            <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>
              {displayName}
            </p>
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              {profile?.elo_rating ?? 1200} ELO
            </p>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm hover:opacity-80"
            style={{ color: theme.textSecondary }}
          >
            Profile
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="block w-full text-left px-3 py-2 text-sm hover:opacity-80"
            style={{ color: theme.textSecondary }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
