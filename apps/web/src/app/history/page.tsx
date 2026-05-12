'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { OnlineGame } from '@raichu/shared-types';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useAuthStore } from '../../store/auth-store';
import { getSupabaseBrowserClient } from '../../lib/supabase/client';
import { Navbar } from '../../components/nav/Navbar';

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
    const userId = user.id;
    async function load() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
          .order('updated_at', { ascending: false })
          .limit(50);

        if (error) throw new Error(error.message);
        setGames((data as OnlineGame[]) || []);
      } catch (err) {
        console.error('Failed to load game history:', err);
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
      <Navbar />
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
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{
                      backgroundColor: theme.bgPanel,
                      borderLeft: `3px solid ${borderColor}`,
                      borderTop: `1px solid ${theme.border}`,
                      borderRight: `1px solid ${theme.border}`,
                      borderBottom: `1px solid ${theme.border}`,
                    }}
                  >
                    <div className="min-w-0 flex-1">
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
                      <span className="text-xs font-medium mr-2" style={{ color: resultColor }}>
                        {resultLabel}
                      </span>
                      <Link
                        href={`/game/${game.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                        style={{ backgroundColor: theme.accent, color: '#fff' }}
                      >
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <path d="M2.5 2L8.5 5.5L2.5 9V2Z" fill="currentColor"/>
                        </svg>
                        Replay
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
