'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { OnlineGame } from '@raichu/shared-types';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useAuthStore } from '../../store/auth-store';
import { gamesApi } from '../../lib/api';
import { NavHeader } from '../../components/nav/NavHeader';

type FilterTab = 'all' | 'ranked' | 'friendly';

export default function HistoryPage() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const router = useRouter();
  const [games, setGames] = useState<OnlineGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');

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

  const finishedGames = games
    .filter((g) => g.status !== 'waiting' && g.status !== 'playing')
    .filter((g) => filter === 'all' || g.game_type === filter);

  const segBtn = (active: boolean) => ({
    backgroundColor: active ? theme.accent : 'transparent',
    color: active ? '#fff' : theme.textSecondary,
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
      <NavHeader title="Game History" backHref="/" backLabel="Home" />
      <main className="px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Filter tabs */}
          <div className="segmented-control mb-6" style={{ backgroundColor: theme.bgSecondary, maxWidth: 280 }}>
            {([['all', 'All'], ['ranked', 'Ranked'], ['friendly', 'Friendly']] as const).map(([val, label]) => (
              <button key={val} style={segBtn(filter === val)} onClick={() => setFilter(val)}>
                {label}
              </button>
            ))}
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
                const isWinnerSide =
                  (game.status === 'white_wins' && isWhite) ||
                  (game.status === 'black_wins' && !isWhite);
                const eloValue = isWinnerSide ? game.winner_elo_delta : game.loser_elo_delta;

                // Left border: green = win, red = loss, gray = abandoned
                const borderColor =
                  game.status === 'abandoned' ? theme.border :
                  isWinner ? '#22c55e' : '#ef4444';

                const resultColor =
                  game.status === 'abandoned'
                    ? theme.textSecondary
                    : isWinner
                      ? '#22c55e'
                      : '#ef4444';

                const date = game.created_at
                  ? new Date(game.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  : '';

                return (
                  <Link
                    key={game.id}
                    href={`/game/${game.id}`}
                    className="flex items-center justify-between p-4 rounded-lg transition-all hover:brightness-110"
                    style={{
                      backgroundColor: theme.bgPanel,
                      borderLeft: `3px solid ${borderColor}`,
                      borderTop: `1px solid ${theme.border}`,
                      borderRight: `1px solid ${theme.border}`,
                      borderBottom: `1px solid ${theme.border}`,
                    }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                          {game.game_type === 'ranked' ? 'Ranked' : 'Friendly'} — {isWhite ? 'White' : 'Black'}
                        </span>
                        <span className="text-xs" style={{ color: theme.textSecondary }}>
                          {game.move_count} moves
                        </span>
                      </div>
                      {date && (
                        <span className="text-xs" style={{ color: theme.textSecondary }}>
                          {date}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {eloValue != null && game.game_type === 'ranked' && (
                        <span
                          className="text-sm font-mono font-bold"
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
    </div>
  );
}
