'use client';

import { useState, useEffect } from 'react';
import type { Profile } from '@raichu/shared-types';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useAuthStore } from '../../store/auth-store';
import { getSupabaseBrowserClient } from '../../lib/supabase/client';
import { Navbar } from '../../components/nav/Navbar';
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable';

export default function LeaderboardPage() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const user = useAuthStore((s) => s.user);
  const [players, setPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error: queryErr } = await supabase
          .from('profiles')
          .select('*')
          .order('elo_rating', { ascending: false })
          .limit(50);

        if (queryErr) throw new Error(queryErr.message);
        if (data) setPlayers(data as Profile[]);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
      <Navbar />
      <main className="px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <p style={{ color: theme.textSecondary }}>Loading...</p>
          ) : error ? (
            <p style={{ color: '#ef4444' }}>{error}</p>
          ) : players.length === 0 ? (
            <p style={{ color: theme.textSecondary }}>No players yet. Be the first to play a ranked game!</p>
          ) : (
            <LeaderboardTable players={players} currentUserId={user?.id} />
          )}
        </div>
      </main>
    </div>
  );
}
