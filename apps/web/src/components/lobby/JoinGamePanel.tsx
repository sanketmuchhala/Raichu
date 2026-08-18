'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { gamesApi } from '../../lib/api';
import { analytics } from '../../lib/analytics';
import { useAuthStore } from '../../store/auth-store';

export function JoinGamePanel() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const router = useRouter();
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin() {
    if (!code.trim()) return;
    setJoining(true);
    setError('');
    const trimmed = code.trim();
    const userId = useAuthStore.getState().user?.id ?? null;
    analytics.joinAttempted({ code: trimmed }, userId);

    try {
      const game = (await gamesApi.joinByCode(trimmed)) as { id: string };
      router.push(`/game/${game.id}`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Failed to join game';
      analytics.joinFailed({ code: trimmed, reason }, userId);
      setError(reason);
    } finally {
      setJoining(false);
    }
  }

  return (
    <div
      className="p-5 rounded-xl"
      style={{ backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}` }}
    >
      <h2 className="text-lg font-bold mb-4" style={{ color: theme.textPrimary }}>
        Join Game
      </h2>

      <label className="text-xs font-medium mb-2 block" style={{ color: theme.textSecondary }}>
        Invite Code
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter 6-letter code"
          maxLength={6}
          className="flex-1 px-3 py-2.5 rounded-lg text-sm font-mono tracking-widest text-center outline-none uppercase"
          style={{
            backgroundColor: theme.bgSecondary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
        />
        <button
          className="px-5 py-2.5 rounded-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: theme.accent }}
          onClick={handleJoin}
          disabled={joining || code.length < 6}
        >
          {joining ? '...' : 'Join'}
        </button>
      </div>

      {error && (
        <p className="text-sm mt-2" style={{ color: '#ef4444' }}>{error}</p>
      )}
    </div>
  );
}
