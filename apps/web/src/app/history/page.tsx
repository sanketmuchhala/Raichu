'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { OnlineGame } from '@raichu/shared-types';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useAuthStore } from '../../store/auth-store';
import { gamesApi } from '../../lib/api';

export default function HistoryPage() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const router = useRouter();
  const [games, setGames] = useState<OnlineGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const data = (await gamesApi.myGames()) as OnlineGame[];
        setGames(data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (!initialized || !user) return null;

  const finishedGames = games.filter(
    (g) => g.status !== 'waiting' && g.status !== 'playing',
  );

  return (
    <main className="min-h-screen px-4 py-8" style={{ backgroundColor: theme.bgPrimary }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-sm hover:underline" style={{ color: theme.accent }}>
            &larr; Home
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
            Game History
          </h1>
        </div>

        {loading ? (
          <p style={{ color: theme.textSecondary }}>Loading...</p>
        ) : finishedGames.length === 0 ? (
          <p style={{ color: theme.textSecondary }}>No completed games yet.</p>
        ) : (
          <div className="space-y-2">
            {finishedGames.map((game) => {
              const isWhite = game.white_player_id === user.id;
              const isWinner = game.winner_id === user.id;
              const resultLabel =
                game.status === 'abandoned'
                  ? 'Abandoned'
                  : isWinner
                    ? 'Won'
                    : 'Lost';
              const resultColor =
                game.status === 'abandoned'
                  ? theme.textSecondary
                  : isWinner
                    ? '#22c55e'
                    : '#ef4444';
              const eloDelta = isWhite ? game.winner_elo_delta : game.loser_elo_delta;
              const isWinnerSide =
                (game.status === 'white_wins' && isWhite) ||
                (game.status === 'black_wins' && !isWhite);
              const eloValue = isWinnerSide ? game.winner_elo_delta : game.loser_elo_delta;

              return (
                <Link
                  key={game.id}
                  href={`/game/${game.id}`}
                  className="flex items-center justify-between p-4 rounded-lg transition-opacity hover:opacity-80"
                  style={{ backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}` }}
                >
                  <div>
                    <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                      {game.game_type === 'ranked' ? 'Ranked' : 'Friendly'} — {isWhite ? 'White' : 'Black'}
                    </span>
                    <span className="text-xs ml-2" style={{ color: theme.textSecondary }}>
                      {game.move_count} moves
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {eloValue != null && game.game_type === 'ranked' && (
                      <span
                        className="text-xs font-mono"
                        style={{ color: (eloValue ?? 0) >= 0 ? '#22c55e' : '#ef4444' }}
                      >
                        {(eloValue ?? 0) >= 0 ? '+' : ''}{eloValue}
                      </span>
                    )}
                    <span className="text-xs font-medium" style={{ color: resultColor }}>
                      {resultLabel}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
