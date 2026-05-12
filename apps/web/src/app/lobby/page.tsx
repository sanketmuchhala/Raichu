'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useAuthStore } from '../../store/auth-store';
import { Navbar } from '../../components/nav/Navbar';
import { CreateGamePanel } from '../../components/lobby/CreateGamePanel';
import { JoinGamePanel } from '../../components/lobby/JoinGamePanel';
import { MatchmakingPanel } from '../../components/lobby/MatchmakingPanel';
import { ActiveGamesList } from '../../components/lobby/ActiveGamesList';

export default function LobbyPage() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const initialized = useAuthStore((s) => s.initialized);
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth');
    }
  }, [initialized, user, router]);

  if (!initialized) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bgPrimary }}>
        <p style={{ color: theme.textSecondary }}>Loading...</p>
      </main>
    );
  }

  if (!user) return null;

  const displayName = profile?.display_name || profile?.username || 'Player';

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
      <Navbar />
      <main className="px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Welcome banner */}
          <div
            className="flex items-center gap-3 mb-6 px-5 py-4 rounded-xl animate-fade-in"
            style={{ backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}` }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: theme.accent, color: '#fff' }}
            >
              {displayName[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: theme.textPrimary }}>
                Welcome back, {displayName}
              </p>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                {profile?.elo_rating ?? 1200} ELO
              </p>
            </div>
          </div>

          {/* Grid: matchmaking+create+join | active games */}
          <div className="grid gap-4 lg:grid-cols-3 animate-slide-up">
            <div className="space-y-4 lg:col-span-2">
              <MatchmakingPanel />
              <div className="grid gap-4 sm:grid-cols-2">
                <CreateGamePanel />
                <JoinGamePanel />
              </div>
            </div>
            <ActiveGamesList />
          </div>
        </div>
      </main>
    </div>
  );
}
