'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useAuthStore } from '../../store/auth-store';
import { CreateGamePanel } from '../../components/lobby/CreateGamePanel';
import { JoinGamePanel } from '../../components/lobby/JoinGamePanel';
import { MatchmakingPanel } from '../../components/lobby/MatchmakingPanel';
import { ActiveGamesList } from '../../components/lobby/ActiveGamesList';

export default function LobbyPage() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const user = useAuthStore((s) => s.user);
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

  return (
    <main className="min-h-screen px-4 py-8" style={{ backgroundColor: theme.bgPrimary }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="text-sm hover:underline"
            style={{ color: theme.accent }}
          >
            &larr; Home
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
            Play Online
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <MatchmakingPanel />
            <CreateGamePanel />
            <JoinGamePanel />
          </div>
          <ActiveGamesList />
        </div>
      </div>
    </main>
  );
}
