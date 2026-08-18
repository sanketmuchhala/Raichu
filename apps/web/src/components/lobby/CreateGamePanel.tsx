'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { gamesApi } from '../../lib/api';
import { analytics } from '../../lib/analytics';
import { useAuthStore } from '../../store/auth-store';

export function CreateGamePanel() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const router = useRouter();
  const [gameType, setGameType] = useState<'friendly' | 'ranked'>('friendly');
  const [playAs, setPlayAs] = useState<'white' | 'black' | 'random'>('random');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const segBtn = (active: boolean) => ({
    backgroundColor: active ? theme.accent : 'transparent',
    color: active ? '#fff' : theme.textSecondary,
  });

  async function handleCreate() {
    setCreating(true);
    setError('');
    try {
      const game = (await gamesApi.create({ gameType, playAs })) as { id: string };
      analytics.gameCreated(
        { gameType, playAs },
        useAuthStore.getState().user?.id ?? null,
      );
      router.push(`/game/${game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div
      className="p-5 rounded-xl"
      style={{ backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}` }}
    >
      <h2 className="text-lg font-bold mb-4" style={{ color: theme.textPrimary }}>
        Create Game
      </h2>

      {/* Game Type */}
      <label className="text-xs font-medium mb-2 block" style={{ color: theme.textSecondary }}>
        Game Type
      </label>
      <div className="segmented-control mb-4" style={{ backgroundColor: theme.bgSecondary }}>
        {([['friendly', 'Friendly'], ['ranked', 'Ranked']] as const).map(([val, label]) => (
          <button key={val} style={segBtn(gameType === val)} onClick={() => setGameType(val)}>
            {label}
          </button>
        ))}
      </div>

      {/* Play As */}
      <label className="text-xs font-medium mb-2 block" style={{ color: theme.textSecondary }}>
        Play As
      </label>
      <div className="segmented-control mb-4" style={{ backgroundColor: theme.bgSecondary }}>
        {([['white', 'White'], ['black', 'Black'], ['random', 'Random']] as const).map(([val, label]) => (
          <button key={val} style={segBtn(playAs === val)} onClick={() => setPlayAs(val)}>
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm mb-3" style={{ color: '#ef4444' }}>{error}</p>
      )}

      <button
        className="w-full py-2.5 rounded-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: theme.accent }}
        onClick={handleCreate}
        disabled={creating}
      >
        {creating ? 'Creating...' : 'Create Game'}
      </button>
    </div>
  );
}
