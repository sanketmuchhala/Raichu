'use client';

import Link from 'next/link';
import { useUIStore } from '../store/ui-store';
import { THEMES } from '../lib/themes';

export default function Home() {
  const theme = useUIStore((s) => THEMES[s.theme]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: theme.bgPrimary }}
    >
      <div className="text-center max-w-lg">
        <h1 className="text-5xl font-bold mb-3" style={{ color: theme.textPrimary }}>
          Raichu
        </h1>
        <p className="text-lg mb-10" style={{ color: theme.textSecondary }}>
          A strategy board game with Pichu, Pikachu, and Raichu
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/play"
            className="px-8 py-3.5 rounded-lg font-bold text-lg text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.accent }}
          >
            Play Now
          </Link>
          <Link
            href="/puzzles"
            className="px-8 py-3.5 rounded-lg font-semibold text-lg transition-opacity hover:opacity-80"
            style={{
              backgroundColor: theme.bgSecondary,
              color: theme.textSecondary,
              borderColor: theme.border,
              borderWidth: 1,
            }}
          >
            Puzzles
          </Link>
          <Link
            href="/rules"
            className="px-8 py-3.5 rounded-lg font-semibold text-lg transition-opacity hover:opacity-80"
            style={{
              backgroundColor: theme.bgSecondary,
              color: theme.textSecondary,
              borderColor: theme.border,
              borderWidth: 1,
            }}
          >
            How to Play
          </Link>
        </div>

        {/* Piece legend */}
        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          {[
            { name: 'Pichu', desc: 'Moves diagonally', symbol: 'w/b' },
            { name: 'Pikachu', desc: 'Moves forward & sideways', symbol: 'W/B' },
            { name: 'Raichu', desc: 'Moves in all directions', symbol: '@/$' },
          ].map((p) => (
            <div key={p.name}>
              <div className="text-sm font-mono mb-1" style={{ color: theme.accent }}>
                {p.symbol}
              </div>
              <div className="font-semibold" style={{ color: theme.textPrimary }}>
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
