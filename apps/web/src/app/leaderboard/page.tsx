'use client';

import { useState, useEffect } from 'react';
import type { Profile } from '@raichu/shared-types';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useAuthStore } from '../../store/auth-store';
import { getSupabaseBrowserClient } from '../../lib/supabase/client';
import { NavHeader } from '../../components/nav/NavHeader';
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable';

export default function LeaderboardPage() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const user = useAuthStore((s) => s.user);
  const [players, setPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('elo_rating', { ascending: false })
        .limit(50);

      if (data) setPlayers(data as Profile[]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
      <NavHeader title="Leaderboard" backHref="/" backLabel="Home" />
      <main className="px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <p style={{ color: theme.textSecondary }}>Loading...</p>
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
