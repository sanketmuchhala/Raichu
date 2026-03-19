'use client';

import { useState } from 'react';
import type { Difficulty, GameMode, Player } from '@raichu/shared-types';
import { useGameStore } from '../../store/game-store';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';

export function NewGameDialog() {
  const show = useUIStore((s) => s.showNewGameDialog);
  const setShow = useUIStore((s) => s.setShowNewGameDialog);
  const theme = useUIStore((s) => THEMES[s.theme]);
  const newGame = useGameStore((s) => s.newGame);

  const [mode, setMode] = useState<GameMode>('pvp');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = useState<Player>('white');

  if (!show) return null;

  const handleStart = () => {
    newGame({ mode, difficulty, playerColor });
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShow(false)}>
      <div
        className="rounded-xl p-6 w-full max-w-sm mx-4 space-y-5"
        style={{ backgroundColor: theme.bgPanel, borderColor: theme.border, borderWidth: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold" style={{ color: theme.textPrimary }}>New Game</h2>

        {/* Mode selection */}
        <div>
          <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>Game Mode</label>
          <div className="flex gap-2">
            {[
              { value: 'pvp' as GameMode, label: 'Local PvP' },
              { value: 'bot' as GameMode, label: 'vs Bot' },
            ].map(({ value, label }) => (
              <button
                key={value}
                className="flex-1 px-3 py-2 rounded text-sm font-medium transition-all"
                style={{
                  backgroundColor: mode === value ? theme.accent : theme.bgSecondary,
                  color: mode === value ? '#fff' : theme.textSecondary,
                  borderColor: theme.border,
                  borderWidth: 1,
                }}
                onClick={() => setMode(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty (bot mode only) */}
        {mode === 'bot' && (
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>Difficulty</label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  className="flex-1 px-3 py-2 rounded text-sm font-medium transition-all capitalize"
                  style={{
                    backgroundColor: difficulty === d ? theme.accent : theme.bgSecondary,
                    color: difficulty === d ? '#fff' : theme.textSecondary,
                    borderColor: theme.border,
                    borderWidth: 1,
                  }}
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
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>Play as</label>
            <div className="flex gap-2">
              {[
                { value: 'white' as Player, label: 'White' },
                { value: 'black' as Player, label: 'Black' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  className="flex-1 px-3 py-2 rounded text-sm font-medium transition-all"
                  style={{
                    backgroundColor: playerColor === value ? theme.accent : theme.bgSecondary,
                    color: playerColor === value ? '#fff' : theme.textSecondary,
                    borderColor: theme.border,
                    borderWidth: 1,
                  }}
                  onClick={() => setPlayerColor(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Start button */}
        <div className="flex gap-3 pt-2">
          <button
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: theme.bgSecondary, color: theme.textSecondary, borderColor: theme.border, borderWidth: 1 }}
            onClick={() => setShow(false)}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-80"
            style={{ backgroundColor: theme.accent, color: '#fff' }}
            onClick={handleStart}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
