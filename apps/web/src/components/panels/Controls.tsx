'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/game-store';
import { useUIStore } from '../../store/ui-store';
import { THEMES, type ThemeName } from '../../lib/themes';

export function Controls() {
  const restart = useGameStore((s) => s.restart);
  const status = useGameStore((s) => s.status);
  const moveCount = useGameStore((s) => s.moveHistory.length);
  const theme = useUIStore((s) => THEMES[s.theme]);
  const themeName = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const flipBoard = useUIStore((s) => s.flipBoard);
  const setShowNewGameDialog = useUIStore((s) => s.setShowNewGameDialog);
  const [restartArmed, setRestartArmed] = useState(false);

  useEffect(() => {
    if (!restartArmed) return;
    const timeout = window.setTimeout(() => setRestartArmed(false), 3500);
    return () => window.clearTimeout(timeout);
  }, [restartArmed]);

  useEffect(() => {
    if (moveCount === 0) setRestartArmed(false);
  }, [moveCount]);

  const handleRestart = () => {
    if (moveCount === 0 || restartArmed) {
      restart();
      setRestartArmed(false);
      return;
    }
    setRestartArmed(true);
  };

  return (
    <div
      className="game-controls panel-card mobile-compact p-3 lg:p-4 flex flex-col gap-2 lg:gap-3"
      style={{
        backgroundColor: theme.bgPanel,
        borderColor: theme.border,
        boxShadow: `0 2px 8px ${theme.shadow}`,
      }}
    >
      {/* Mobile action dock */}
      <div className="game-actions flex lg:hidden">
        <button
          className="game-action game-action-primary"
          style={{ backgroundColor: theme.accent, color: '#fff' }}
          onClick={() => setShowNewGameDialog(true)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>New game</span>
        </button>
        <button
          className={`game-action${restartArmed ? ' is-confirming' : ''}`}
          style={{ backgroundColor: restartArmed ? '#a84444' : theme.btnSecondaryBg, color: restartArmed ? '#fff' : theme.textSecondary }}
          aria-label={restartArmed ? 'Confirm restart and erase current game' : 'Restart game'}
          onClick={handleRestart}
        >
          {restartArmed ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 4.2v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="10" cy="14.7" r="1" fill="currentColor" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5.2 6.2A6 6 0 1110 16a5.98 5.98 0 01-5.65-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M3.5 3.8v4h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <span>{restartArmed ? 'Confirm' : 'Restart'}</span>
        </button>
        <button
          className="game-action"
          style={{ backgroundColor: theme.btnSecondaryBg, color: theme.textSecondary }}
          onClick={flipBoard}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5.5 6.5h8.75M12 4.25l2.25 2.25L12 8.75M14.5 13.5H5.75M8 11.25L5.75 13.5 8 15.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Flip</span>
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
          className={`btn${restartArmed ? ' is-confirming' : ''}`}
          style={{
            backgroundColor: restartArmed ? '#a84444' : theme.btnSecondaryBg,
            color: restartArmed ? '#fff' : theme.textSecondary,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = restartArmed ? '#963b3b' : theme.btnSecondaryHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = restartArmed ? '#a84444' : theme.btnSecondaryBg)}
          aria-label={restartArmed ? 'Confirm restart and erase current game' : 'Restart game'}
          onClick={handleRestart}
        >
          {restartArmed ? 'Confirm restart' : 'Restart'}
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
