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
      className="panel-card mobile-compact p-3 lg:p-4 flex flex-col gap-2 lg:gap-3"
      style={{
        backgroundColor: theme.bgPanel,
        borderColor: theme.border,
        boxShadow: `0 2px 8px ${theme.shadow}`,
      }}
    >
      {/* Mobile: all 3 buttons in a single row */}
      <div className="flex lg:hidden gap-2">
        <button
          className="btn"
          style={{ backgroundColor: theme.accent, color: '#fff' }}
          onClick={() => setShowNewGameDialog(true)}
        >
          New Game
        </button>
        <button
          className="btn"
          style={{ backgroundColor: theme.btnSecondaryBg, color: theme.textSecondary }}
          onClick={restart}
        >
          Restart
        </button>
        <button
          className="btn"
          style={{ backgroundColor: theme.btnSecondaryBg, color: theme.textSecondary }}
          onClick={flipBoard}
        >
          Flip
        </button>
      </div>

      {/* Desktop: original layout (unchanged) */}
      <div className="hidden lg:block">
        <button
          className="btn"
          style={{ backgroundColor: theme.accent, color: '#fff' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.accentHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.accent)}
          onClick={() => setShowNewGameDialog(true)}
        >
          New Game
        </button>
      </div>
      <div className="hidden lg:flex gap-2">
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

      {/* Theme selector — hidden on mobile, visible on desktop */}
      <div className="hidden lg:block">
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

      {/* Game over indicator — desktop only */}
      {status !== 'playing' && (
        <div
          className="hidden lg:block text-center py-2.5 rounded-lg animate-fade-in"
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
