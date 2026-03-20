'use client';

import Link from 'next/link';
import { useUIStore } from '../store/ui-store';
import { THEMES } from '../lib/themes';
import { UserMenu } from '../components/auth/UserMenu';

export default function Home() {
  const theme = useUIStore((s) => THEMES[s.theme]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-4 relative"
      style={{ backgroundColor: theme.bgPrimary }}
    >
      <div className="absolute top-4 right-4">
        <UserMenu />
      </div>

      <div className="text-center max-w-xl w-full">
        <h1 className="text-5xl font-bold mb-2" style={{ color: theme.textPrimary }}>
          Raichu
        </h1>
        <p className="text-base mb-8" style={{ color: theme.textSecondary }}>
          A strategy board game with Pichu, Pikachu, and Raichu
        </p>

        {/* Primary actions */}
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-4">
          <Link
            href="/play"
            className="flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: theme.accent }}
          >
            Play Now
          </Link>
          <Link
            href="/lobby"
            className="flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: theme.accentHover }}
          >
            Play Online
          </Link>
        </div>

        {/* Secondary actions */}
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
          <Link
            href="/puzzles"
            className="flex items-center justify-center px-6 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-80"
            style={{
              backgroundColor: theme.bgSecondary,
              color: theme.textSecondary,
              border: `1px solid ${theme.border}`,
            }}
          >
            Puzzles
          </Link>
          <Link
            href="/rules"
            className="flex items-center justify-center px-6 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-80"
            style={{
              backgroundColor: theme.bgSecondary,
              color: theme.textSecondary,
              border: `1px solid ${theme.border}`,
            }}
          >
            How to Play
          </Link>
        </div>

        {/* Quick links */}
        <div className="flex gap-4 justify-center mb-10">
          <Link
            href="/leaderboard"
            className="text-sm hover:underline"
            style={{ color: theme.textSecondary }}
          >
            Leaderboard
          </Link>
          <Link
            href="/history"
            className="text-sm hover:underline"
            style={{ color: theme.textSecondary }}
          >
            Game History
          </Link>
        </div>

        {/* Piece legend */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { name: 'Pichu', desc: 'Moves diagonally', symbol: 'w/b' },
            { name: 'Pikachu', desc: 'Moves forward & sideways', symbol: 'W/B' },
            { name: 'Raichu', desc: 'Moves in all directions', symbol: '@/$' },
          ].map((p) => (
            <div
              key={p.name}
              className="p-3 rounded-lg"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              <div className="text-sm font-mono mb-1" style={{ color: theme.accent }}>
                {p.symbol}
              </div>
              <div className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
                {p.name}
              </div>
              <div className="text-xs" style={{ color: theme.textSecondary }}>
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
