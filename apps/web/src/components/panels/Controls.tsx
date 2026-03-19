'use client';

import { useGameStore } from '../../store/game-store';
import { useUIStore } from '../../store/ui-store';
import { THEMES, type ThemeName } from '../../lib/themes';

export function Controls() {
  const restart = useGameStore((s) => s.restart);
  const status = useGameStore((s) => s.status);
  const theme = useUIStore((s) => THEMES[s.theme]);
  const themeName = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const flipBoard = useUIStore((s) => s.flipBoard);
  const setShowNewGameDialog = useUIStore((s) => s.setShowNewGameDialog);

  return (
    <div
      className="rounded-lg p-4 space-y-3"
      style={{ backgroundColor: theme.bgPanel, borderColor: theme.border, borderWidth: 1 }}
    >
      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          className="flex-1 px-3 py-2 rounded text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ backgroundColor: theme.accent, color: '#fff' }}
          onClick={() => setShowNewGameDialog(true)}
        >
          New Game
        </button>
        <button
          className="flex-1 px-3 py-2 rounded text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ backgroundColor: theme.bgSecondary, color: theme.textPrimary, borderColor: theme.border, borderWidth: 1 }}
          onClick={restart}
        >
          Restart
        </button>
      </div>

      {/* Flip board */}
      <button
        className="w-full px-3 py-2 rounded text-sm transition-opacity hover:opacity-80"
        style={{ backgroundColor: theme.bgSecondary, color: theme.textSecondary, borderColor: theme.border, borderWidth: 1 }}
        onClick={flipBoard}
      >
        Flip Board
      </button>

      {/* Theme selector */}
      <div>
        <label className="text-xs block mb-1" style={{ color: theme.textSecondary }}>Theme</label>
        <div className="flex gap-2">
          {(['classic', 'slate', 'walnut'] as ThemeName[]).map((t) => (
            <button
              key={t}
              className="flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: themeName === t ? theme.accent : theme.bgSecondary,
                color: themeName === t ? '#fff' : theme.textSecondary,
                borderColor: theme.border,
                borderWidth: 1,
              }}
              onClick={() => setTheme(t)}
            >
              {THEMES[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Game over indicator */}
      {status !== 'playing' && (
        <div className="text-center py-2 rounded" style={{ backgroundColor: theme.accent + '20' }}>
          <p className="text-sm font-bold" style={{ color: theme.accent }}>
            {status === 'white_wins' ? 'White wins!' : 'Black wins!'}
          </p>
        </div>
      )}
    </div>
  );
}
