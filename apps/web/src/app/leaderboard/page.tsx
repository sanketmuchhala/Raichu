'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Profile } from '@raichu/shared-types';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useAuthStore } from '../../store/auth-store';
import { getSupabaseBrowserClient } from '../../lib/supabase/client';
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
    <main className="min-h-screen px-4 py-8" style={{ backgroundColor: theme.bgPrimary }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-sm hover:underline" style={{ color: theme.accent }}>
            &larr; Home
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
            Leaderboard
          </h1>
        </div>

        {loading ? (
          <p style={{ color: theme.textSecondary }}>Loading...</p>
        ) : players.length === 0 ? (
          <p style={{ color: theme.textSecondary }}>No players yet. Be the first to play a ranked game!</p>
        ) : (
          <LeaderboardTable players={players} currentUserId={user?.id} />
        )}
      </div>
    </main>
  );
}
