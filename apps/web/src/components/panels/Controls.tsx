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
      className="panel-card p-4 flex flex-col gap-3"
      style={{
        backgroundColor: theme.bgPanel,
        borderColor: theme.border,
        boxShadow: `0 2px 8px ${theme.shadow}`,
      }}
    >
      {/* Primary action */}
      <button
        className="btn"
        style={{ backgroundColor: theme.accent, color: '#fff' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.accentHover)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.accent)}
        onClick={() => setShowNewGameDialog(true)}
      >
        New Game
      </button>

      {/* Secondary actions */}
      <div className="flex gap-2">
        <button
          className="btn"
          style={{
            backgroundColor: theme.btnSecondaryBg,
            color: theme.textSecondary,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryBg)}
          onClick={restart}
        >
          Restart
        </button>
        <button
          className="btn"
          style={{
            backgroundColor: theme.btnSecondaryBg,
            color: theme.textSecondary,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryBg)}
          onClick={flipBoard}
        >
          Flip Board
        </button>
      </div>

      {/* Theme selector — segmented control */}
      <div>
        <label className="text-xs block mb-1.5 font-medium" style={{ color: theme.textSecondary }}>
          Theme
        </label>
        <div
          className="segmented-control"
          style={{ backgroundColor: theme.bgSecondary }}
        >
          {(['classic', 'slate', 'walnut'] as ThemeName[]).map((t) => (
            <button
              key={t}
              style={{
                backgroundColor: themeName === t ? theme.accent : 'transparent',
                color: themeName === t ? '#fff' : theme.textSecondary,
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
        <div
          className="text-center py-2.5 rounded-lg animate-fade-in"
          style={{ backgroundColor: theme.accent + '18' }}
        >
          <p className="text-sm font-bold" style={{ color: theme.accent }}>
            {status === 'white_wins' ? 'White wins!' : 'Black wins!'}
          </p>
        </div>
      )}
    </div>
  );
}
