'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUIStore } from '../../../store/ui-store';
import { THEMES } from '../../../lib/themes';
import { useAuthStore } from '../../../store/auth-store';
import { gamesApi } from '../../../lib/api';

export default function JoinByCodePage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  const theme = useUIStore((s) => THEMES[s.theme]);
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.push(`/auth?next=/join/${code}`);
      return;
    }

    async function join() {
      try {
        const game = (await gamesApi.joinByCode(code)) as { id: string };
        router.replace(`/game/${game.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join game');
      }
    }
    join();
  }, [initialized, user, code, router]);

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bgPrimary }}>
      {error ? (
        <div className="text-center">
          <p className="mb-4" style={{ color: '#ef4444' }}>{error}</p>
          <button
            onClick={() => router.push('/lobby')}
            className="text-sm hover:underline"
            style={{ color: theme.accent }}
          >
            Go to Lobby
          </button>
        </div>
      ) : (
        <p style={{ color: theme.textSecondary }}>Joining game...</p>
      )}
    </main>
  );
}
