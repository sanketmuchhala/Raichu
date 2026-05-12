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

function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
      <path d="M3.5 2.5L10.5 6.5L3.5 10.5V2.5Z" fill="currentColor" />
    </svg>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: sameYear ? undefined : 'numeric' });
}

export default function HistoryPage() {
  const theme       = useUIStore((s) => THEMES[s.theme]);
  const user        = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const router      = useRouter();
  const [games, setGames]   = useState<OnlineGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<FilterTab>('all');

  useEffect(() => {
    if (initialized && !user) router.push('/auth');
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

  const allFinished = games.filter((g) => g.status !== 'waiting' && g.status !== 'playing');
  const wins        = allFinished.filter((g) => g.winner_id === user.id).length;
  const losses      = allFinished.filter((g) => g.status !== 'abandoned' && g.winner_id !== user.id).length;
  const winRate     = allFinished.length > 0 ? Math.round((wins / allFinished.length) * 100) : 0;

  const finishedGames = allFinished.filter((g) => filter === 'all' || g.game_type === filter);

  const FILTERS: [FilterTab, string][] = [['all', 'All'], ['ranked', 'Ranked'], ['friendly', 'Friendly']];

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
      <Navbar />

      <main className="px-4 pt-8 pb-16" style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* ── Page header ── */}
        <div className="mb-8">
          <h1
            className="text-2xl font-bold tracking-tight mb-1"
            style={{ color: theme.textPrimary, fontFamily: 'var(--font-sans)' }}
          >
            Game History
          </h1>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            {allFinished.length} completed game{allFinished.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* ── Stats strip ── */}
        {!loading && allFinished.length > 0 && (
          <div
            className="grid grid-cols-3 mb-6 rounded-xl overflow-hidden"
            style={{ border: `1px solid ${theme.border}` }}
          >
            {[
              { label: 'Won',      value: wins,                color: '#22c55e' },
              { label: 'Lost',     value: losses,              color: '#ef4444' },
              { label: 'Win rate', value: `${winRate}%`,       color: theme.accent },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="flex flex-col items-center py-4"
                style={{
                  backgroundColor: theme.bgPanel,
                  borderRight: i < 2 ? `1px solid ${theme.border}` : 'none',
                }}
              >
                <span
                  className="text-xl font-bold tabular-nums"
                  style={{ color: stat.color, fontFamily: 'var(--font-sans)' }}
                >
                  {stat.value}
                </span>
                <span className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter tabs ── */}
        <div
          className="flex rounded-lg p-1 mb-5"
          style={{ backgroundColor: theme.bgSecondary, display: 'inline-flex', gap: 2 }}
        >
          {FILTERS.map(([val, label]) => {
            const active = filter === val;
            return (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className="text-sm font-medium px-4 py-1.5 rounded-md transition-all"
                style={{
                  backgroundColor: active ? theme.accent : 'transparent',
                  color:            active ? '#fff'       : theme.textSecondary,
                  border:           'none',
                  cursor:           'pointer',
                  fontFamily:       'var(--font-sans)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Game list ── */}
        {loading ? (
          /* Loading skeletons */
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{
                  height: 72,
                  backgroundColor: theme.bgPanel,
                  border: `1px solid ${theme.border}`,
                  opacity: 1 - i * 0.15,
                  animation: 'pulse 1.8s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        ) : finishedGames.length === 0 ? (
          /* Empty state */
          <div
            className="flex flex-col items-center justify-center py-20 rounded-xl"
            style={{ border: `1px dashed ${theme.border}`, color: theme.textSecondary }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-4 opacity-30">
              <rect x="4" y="4" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="1.5"/>
              {[0,1,2,3].map(r => [0,1,2,3].map(c => (
                <rect key={`${r}-${c}`}
                  x={4 + c * 8} y={4 + r * 8}
                  width="8" height="8"
                  fill={(r + c) % 2 === 0 ? 'currentColor' : 'none'}
                  opacity="0.3"
                />
              )))}
            </svg>
            <p className="text-sm font-medium">No games yet</p>
            <p className="text-xs mt-1 opacity-70">Play online to see your history here</p>
            <Link
              href="/lobby"
              className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: theme.accent, color: '#fff', textDecoration: 'none' }}
            >
              Find a game
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {finishedGames.map((game, idx) => {
              const isWhite     = game.white_player_id === user.id;
              const isWinner    = game.winner_id === user.id;
              const isAbandoned = game.status === 'abandoned';

              const resultLabel = isAbandoned ? '–' : isWinner ? 'W' : 'L';
              const resultColor = isAbandoned ? theme.textSecondary : isWinner ? '#22c55e' : '#ef4444';
              const accentBar   = isAbandoned ? theme.border : isWinner ? '#22c55e' : '#ef4444';

              const isWinnerSide = (game.status === 'white_wins' && isWhite) || (game.status === 'black_wins' && !isWhite);
              const eloValue     = isWinnerSide ? game.winner_elo_delta : game.loser_elo_delta;
              const eloColor     = (eloValue ?? 0) >= 0 ? '#22c55e' : '#ef4444';

              const date = game.created_at ? formatDate(game.created_at) : '';

              return (
                <div
                  key={game.id}
                  className="flex items-center rounded-xl overflow-hidden transition-all"
                  style={{
                    height: 72,
                    backgroundColor: theme.bgPanel,
                    border: `1px solid ${theme.border}`,
                    animationDelay: `${idx * 40}ms`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.accent + '55')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = theme.border)}
                >
                  {/* Left accent bar */}
                  <div style={{ width: 4, height: '100%', backgroundColor: accentBar, flexShrink: 0 }} />

                  {/* Result circle */}
                  <div
                    style={{
                      width: 52,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        backgroundColor: resultColor + '18',
                        border: `1.5px solid ${resultColor}44`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: resultColor,
                        fontWeight: 800,
                        fontSize: 14,
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {resultLabel}
                    </div>
                  </div>

                  {/* Game info */}
                  <div style={{ flex: 1, minWidth: 0, paddingLeft: 4, paddingRight: 12 }}>
                    <div
                      className="font-semibold text-sm truncate"
                      style={{ color: theme.textPrimary, fontFamily: 'var(--font-sans)' }}
                    >
                      {game.game_type === 'ranked' ? 'Ranked' : 'Friendly'}
                      <span
                        className="ml-2 text-xs font-normal"
                        style={{ color: theme.textSecondary }}
                      >
                        as {isWhite ? 'White' : 'Black'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5" style={{ color: theme.textSecondary, fontSize: 12 }}>
                      <span>{game.move_count} moves</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{date}</span>
                    </div>
                  </div>

                  {/* ELO delta — fixed 60px */}
                  <div
                    style={{
                      width: 60,
                      textAlign: 'right',
                      flexShrink: 0,
                      paddingRight: 12,
                    }}
                  >
                    {eloValue != null && game.game_type === 'ranked' && (
                      <span
                        style={{
                          fontFamily: 'ui-monospace, monospace',
                          fontWeight: 700,
                          fontSize: 13,
                          color: eloColor,
                        }}
                      >
                        {(eloValue ?? 0) >= 0 ? '+' : ''}{eloValue}
                      </span>
                    )}
                  </div>

                  {/* Replay button — fixed 104px */}
                  <div style={{ width: 104, paddingRight: 12, flexShrink: 0 }}>
                    <Link
                      href={`/game/${game.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        width: '100%',
                        height: 36,
                        backgroundColor: theme.accent,
                        color: '#fff',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: 'none',
                        fontFamily: 'var(--font-sans)',
                        transition: 'opacity 150ms',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <PlayIcon />
                      Replay
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
