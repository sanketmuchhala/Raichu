'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Difficulty, GameMode, Player } from '@raichu/shared-types';
import { useGameStore } from '../../store/game-store';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { BOT_NAME } from '../../lib/constants';
import { PieceSVG } from '../pieces/PieceSVG';

const MODE_OPTIONS: Array<{
  value: GameMode;
  title: string;
  description: string;
  badge: string;
}> = [
  { value: 'bot', title: `Play ${BOT_NAME}`, description: 'A focused solo game with adjustable strength.', badge: 'Instant' },
  { value: 'pvp', title: 'Local game', description: 'Pass this device between two players.', badge: '2 players' },
  { value: 'online', title: 'Play online', description: 'Head to the lobby and challenge a real player.', badge: 'Live' },
];

const DIFFICULTY_OPTIONS: Array<{
  value: Difficulty;
  label: string;
  description: string;
}> = [
  { value: 'easy', label: 'Easy', description: 'Learn the board' },
  { value: 'medium', label: 'Medium', description: 'Balanced play' },
  { value: 'hard', label: 'Hard', description: 'Think carefully' },
];

function ModeIcon({ mode }: { mode: GameMode }) {
  if (mode === 'bot') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="6" width="16" height="13" rx="4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 3v3M8.5 12h.01M15.5 12h.01M9 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (mode === 'pvp') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="8.5" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="16.5" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3.5 20c.5-4 2.2-6 5.1-6 2.8 0 4.5 2 5 6M14 15c3.6-.7 5.8.9 6.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 12h17M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21M12 3C9.6 5.5 8.4 8.5 8.4 12s1.2 6.5 3.6 9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function NewGameDialog() {
  const show = useUIStore((s) => s.showNewGameDialog);
  const setShow = useUIStore((s) => s.setShowNewGameDialog);
  const theme = useUIStore((s) => THEMES[s.theme]);
  const newGame = useGameStore((s) => s.newGame);
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<GameMode>(useGameStore.getState().gameMode);
  const [difficulty, setDifficulty] = useState<Difficulty>(useGameStore.getState().difficulty);
  const [playerColor, setPlayerColor] = useState<Player>(useGameStore.getState().playerColor);

  useEffect(() => {
    if (!show) return;

    const current = useGameStore.getState();
    setMode(current.gameMode);
    setDifficulty(current.difficulty);
    setPlayerColor(current.playerColor);

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>('button')?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setShow(false);
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;
      const focusIsOutside = !dialogRef.current.contains(activeElement);
      if (event.shiftKey && (activeElement === first || focusIsOutside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeElement === last || focusIsOutside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [setShow, show]);

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

  const summary = mode === 'bot'
    ? `${playerColor === 'white' ? 'You move first' : `${BOT_NAME} moves first`} · ${difficulty[0].toUpperCase()}${difficulty.slice(1)} difficulty`
    : mode === 'pvp'
      ? 'Pass and play on this device · White moves first'
      : 'Continue to the lobby to find or join a match';

  const startLabel = mode === 'online'
    ? 'Continue to lobby'
    : mode === 'bot'
      ? `Play ${BOT_NAME}`
      : 'Start local game';

  return (
    <div
      className="new-game-overlay fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.68)', backdropFilter: 'blur(8px)' }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setShow(false);
      }}
    >
      <div
        ref={dialogRef}
        className="new-game-dialog panel-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        style={{
          backgroundColor: theme.bgPanel,
          borderColor: theme.border,
          boxShadow: `0 24px 72px ${theme.shadow}`,
          ['--dialog-accent' as string]: theme.accent,
          ['--dialog-accent-soft' as string]: `${theme.accent}1f`,
          ['--dialog-border' as string]: theme.border,
          ['--dialog-panel' as string]: theme.bgSecondary,
          ['--dialog-text' as string]: theme.textPrimary,
          ['--dialog-muted' as string]: theme.textSecondary,
        }}
      >
        <header className="new-game-header">
          <div>
            <span className="new-game-kicker" style={{ color: theme.accent }}>Fresh board</span>
            <h2 id={titleId} className="new-game-title" style={{ color: theme.textPrimary }}>Choose your game</h2>
            <p id={descriptionId} className="new-game-description" style={{ color: theme.textSecondary }}>
              Pick a mode now. You can change everything again later.
            </p>
          </div>
          <button
            type="button"
            className="new-game-close"
            aria-label="Close new game setup"
            style={{ color: theme.textSecondary, backgroundColor: theme.bgSecondary }}
            onClick={() => setShow(false)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="new-game-content">
          <div className="new-game-mode-grid" role="radiogroup" aria-label="Game mode">
            {MODE_OPTIONS.map((option) => {
              const active = mode === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  role="radio"
                  aria-checked={active}
                  className={`new-game-mode${active ? ' is-selected' : ''}`}
                  style={{
                    backgroundColor: active ? `${theme.accent}14` : theme.bgSecondary,
                    borderColor: active ? theme.accent : theme.border,
                    color: theme.textPrimary,
                  }}
                  onClick={() => setMode(option.value)}
                >
                  <span
                    className="new-game-mode-icon"
                    style={{ backgroundColor: active ? theme.accent : theme.bgPrimary, color: active ? '#fff' : theme.textSecondary }}
                  >
                    <ModeIcon mode={option.value} />
                  </span>
                  <span className="new-game-mode-copy">
                    <span className="new-game-mode-heading">
                      <strong>{option.title}</strong>
                      <small style={{ color: active ? theme.accent : theme.textSecondary }}>{option.badge}</small>
                    </span>
                    <span style={{ color: theme.textSecondary }}>{option.description}</span>
                  </span>
                  <span className="new-game-check" aria-hidden="true">
                    {active && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8.3l3.1 3.1L13 4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {mode === 'bot' && (
            <div className="new-game-settings">
              <fieldset className="new-game-setting-group">
                <legend style={{ color: theme.textPrimary }}>Difficulty</legend>
                <p style={{ color: theme.textSecondary }}>How much time the computer spends calculating.</p>
                <div className="new-game-choice-grid">
                  {DIFFICULTY_OPTIONS.map((option) => {
                    const active = difficulty === option.value;
                    return (
                      <button
                        type="button"
                        key={option.value}
                        className={`new-game-choice${active ? ' is-selected' : ''}`}
                        aria-pressed={active}
                        style={{
                          backgroundColor: active ? `${theme.accent}14` : theme.bgSecondary,
                          borderColor: active ? theme.accent : theme.border,
                          color: active ? theme.textPrimary : theme.textSecondary,
                        }}
                        onClick={() => setDifficulty(option.value)}
                      >
                        <strong>{option.label}</strong>
                        <small>{option.description}</small>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="new-game-setting-group">
                <legend style={{ color: theme.textPrimary }}>Play as</legend>
                <p style={{ color: theme.textSecondary }}>White always makes the opening move.</p>
                <div className="new-game-color-grid">
                  {([
                    { value: 'white' as Player, label: 'White', note: 'You move first', piece: 'w' as const },
                    { value: 'black' as Player, label: 'Black', note: `${BOT_NAME} moves first`, piece: 'b' as const },
                  ]).map((option) => {
                    const active = playerColor === option.value;
                    return (
                      <button
                        type="button"
                        key={option.value}
                        className={`new-game-color${active ? ' is-selected' : ''}`}
                        aria-pressed={active}
                        style={{
                          backgroundColor: active ? `${theme.accent}14` : theme.bgSecondary,
                          borderColor: active ? theme.accent : theme.border,
                          color: theme.textPrimary,
                        }}
                        onClick={() => setPlayerColor(option.value)}
                      >
                        <span className="new-game-color-piece"><PieceSVG piece={option.piece} size={42} /></span>
                        <span>
                          <strong>{option.label}</strong>
                          <small style={{ color: theme.textSecondary }}>{option.note}</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          )}

          <div className="new-game-summary" style={{ backgroundColor: `${theme.accent}12`, color: theme.textSecondary }}>
            <span className="new-game-summary-dot" style={{ backgroundColor: theme.accent }} />
            <span>{summary}</span>
          </div>
        </div>

        <footer className="new-game-actions" style={{ borderColor: theme.border }}>
          <button
            type="button"
            className="new-game-cancel"
            style={{ backgroundColor: theme.btnSecondaryBg, color: theme.textSecondary }}
            onClick={() => setShow(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="new-game-start"
            style={{ backgroundColor: theme.accent, color: '#fff', boxShadow: `0 8px 24px ${theme.accent}30` }}
            onClick={handleStart}
          >
            <span>{startLabel}</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3.5 9h11M10.5 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </footer>
      </div>
    </div>
  );
}
