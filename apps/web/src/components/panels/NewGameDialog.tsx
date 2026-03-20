'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Difficulty, GameMode, Player } from '@raichu/shared-types';
import { useGameStore } from '../../store/game-store';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';

export function NewGameDialog() {
  const show = useUIStore((s) => s.showNewGameDialog);
  const setShow = useUIStore((s) => s.setShowNewGameDialog);
  const theme = useUIStore((s) => THEMES[s.theme]);
  const newGame = useGameStore((s) => s.newGame);
  const router = useRouter();

  const [mode, setMode] = useState<GameMode>('pvp');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = useState<Player>('white');

  if (!show) return null;

  const handleStart = () => {
    if (mode === 'online') {
      setShow(false);
      router.push('/lobby');
      return;
    }
    newGame({ mode, difficulty, playerColor });
    setShow(false);
  };

  const segBtnStyle = (active: boolean) => ({
    backgroundColor: active ? theme.accent : 'transparent',
    color: active ? '#fff' : theme.textSecondary,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={() => setShow(false)}
    >
      <div
        className="panel-card p-6 w-full max-w-sm mx-4 space-y-5 animate-fade-in"
        style={{
          backgroundColor: theme.bgPanel,
          borderColor: theme.border,
          boxShadow: `0 16px 48px ${theme.shadow}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
          New Game
        </h2>

        {/* Mode selection */}
        <div>
          <label className="text-xs mb-2 block font-medium" style={{ color: theme.textSecondary }}>
            Game Mode
          </label>
          <div className="segmented-control" style={{ backgroundColor: theme.bgSecondary }}>
            {[
              { value: 'pvp' as GameMode, label: 'Local PvP' },
              { value: 'bot' as GameMode, label: 'vs Bot' },
              { value: 'online' as GameMode, label: 'Online' },
            ].map(({ value, label }) => (
              <button key={value} style={segBtnStyle(mode === value)} onClick={() => setMode(value)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty (bot mode only) */}
        {mode === 'bot' && (
          <div>
            <label className="text-xs mb-2 block font-medium" style={{ color: theme.textSecondary }}>
              Difficulty
            </label>
            <div className="segmented-control" style={{ backgroundColor: theme.bgSecondary }}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  className="capitalize"
                  style={segBtnStyle(difficulty === d)}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Player color (bot mode only) */}
        {mode === 'bot' && (
          <div>
            <label className="text-xs mb-2 block font-medium" style={{ color: theme.textSecondary }}>
              Play as
            </label>
            <div className="segmented-control" style={{ backgroundColor: theme.bgSecondary }}>
              {[
                { value: 'white' as Player, label: 'White' },
                { value: 'black' as Player, label: 'Black' },
              ].map(({ value, label }) => (
                <button key={value} style={segBtnStyle(playerColor === value)} onClick={() => setPlayerColor(value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          <button
            className="btn"
            style={{
              backgroundColor: theme.btnSecondaryBg,
              color: theme.textSecondary,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryBg)}
            onClick={() => setShow(false)}
          >
            Cancel
          </button>
          <button
            className="btn"
            style={{ backgroundColor: theme.accent, color: '#fff' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.accentHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.accent)}
            onClick={handleStart}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
