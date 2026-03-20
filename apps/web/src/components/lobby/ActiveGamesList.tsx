'use client';

import { useState, useEffect } from 'react';
import type { OnlineGame } from '@raichu/shared-types';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useAuthStore } from '../../store/auth-store';
import { getSupabaseBrowserClient } from '../../lib/supabase/client';
import { GameCard } from './GameCard';

export function ActiveGamesList() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const user = useAuthStore((s) => s.user);
  const [games, setGames] = useState<OnlineGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    let cancelled = false;
    async function load() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error: queryErr } = await supabase
          .from('games')
          .select('*')
          .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
          .order('updated_at', { ascending: false })
          .limit(20);

        if (queryErr) throw new Error(queryErr.message);
        if (!cancelled) setGames((data as OnlineGame[]) || []);
      } catch (err) {
        console.error('Failed to load games:', err);
        if (!cancelled) setError('Failed to load games');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  if (!user) return null;

  const activeGames = games.filter((g) => g.status === 'waiting' || g.status === 'playing');
  const recentGames = games.filter((g) => g.status !== 'waiting' && g.status !== 'playing');

  return (
    <div
      className="p-5 rounded-xl"
      style={{ backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}` }}
    >
      <h2 className="text-lg font-bold mb-4" style={{ color: theme.textPrimary }}>
        Your Games
      </h2>

      {loading && (
        <p className="text-sm" style={{ color: theme.textSecondary }}>Loading...</p>
      )}

      {error && (
        <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
      )}

      {!loading && !error && activeGames.length === 0 && recentGames.length === 0 && (
        <p className="text-sm" style={{ color: theme.textSecondary }}>
          No games yet. Create one above!
        </p>
      )}

      {activeGames.length > 0 && (
        <div className="space-y-2 mb-4">
          <h3 className="text-xs font-medium uppercase" style={{ color: theme.textSecondary }}>
            Active
          </h3>
          {activeGames.map((g) => (
            <GameCard key={g.id} game={g} userId={user.id} />
          ))}
        </div>
      )}

      {recentGames.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium uppercase" style={{ color: theme.textSecondary }}>
            Recent
          </h3>
          {recentGames.map((g) => (
            <GameCard key={g.id} game={g} userId={user.id} />
          ))}
        </div>
      )}
    </div>
  );
}
