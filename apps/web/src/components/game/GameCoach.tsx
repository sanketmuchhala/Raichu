'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useGameStore } from '../../store/game-store';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { BOT_NAME } from '../../lib/constants';

export function GameCoach() {
  const [dismissed, setDismissed] = useState(false);
  const theme = useUIStore((s) => THEMES[s.theme]);
  const replayMode = useUIStore((s) => s.replayMode);
  const status = useGameStore((s) => s.status);
  const gameMode = useGameStore((s) => s.gameMode);
  const playerColor = useGameStore((s) => s.playerColor);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const selectedPiece = useGameStore((s) => s.selectedPiece);
  const legalMoves = useGameStore((s) => s.legalMoves);
  const isThinking = useGameStore((s) => s.isThinking);
  const moveCount = useGameStore((s) => s.moveHistory.length);

  if (dismissed || replayMode || status !== 'playing' || moveCount >= 2) return null;

  const captureCount = legalMoves.filter((move) => move.captured).length;
  const isPlayersTurn = gameMode !== 'bot' || currentPlayer === playerColor;

  const message = (() => {
    if (isThinking || !isPlayersTurn) {
      return {
        title: `${BOT_NAME} is thinking`,
        body: 'Scan the highlighted last move and plan your reply.',
        icon: 'thinking',
      } as const;
    }

    if (selectedPiece) {
      return {
        title: 'Choose a highlighted square',
        body: `${legalMoves.length} legal ${legalMoves.length === 1 ? 'move' : 'moves'}${captureCount > 0 ? ` · ${captureCount} capture ${captureCount === 1 ? 'available' : 'options'}` : ''}`,
        icon: 'target',
      } as const;
    }

    if (gameMode === 'pvp' && moveCount === 1) {
      return {
        title: 'Pass the board to Black',
        body: 'Tap or drag a black piece to continue.',
        icon: 'handoff',
      } as const;
    }

    return {
      title: gameMode === 'bot' ? 'Your move' : `${currentPlayer === 'white' ? 'White' : 'Black'} moves first`,
      body: 'Tap a piece to reveal its moves, or drag it directly.',
      icon: 'pointer',
    } as const;
  })();

  return (
    <aside
      className="game-coach"
      role="status"
      aria-live="polite"
      style={{
        backgroundColor: `${theme.accent}12`,
        borderColor: `${theme.accent}40`,
        ['--coach-accent' as string]: theme.accent,
      }}
    >
      <span className={`game-coach-icon is-${message.icon}`} style={{ backgroundColor: `${theme.accent}22`, color: theme.accent }}>
        {message.icon === 'target' ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="9" cy="9" r="2" fill="currentColor" />
          </svg>
        ) : message.icon === 'thinking' ? (
          <span className="game-coach-thinking" aria-hidden="true"><i /><i /><i /></span>
        ) : message.icon === 'handoff' ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M3 6h10M10 3l3 3-3 3M15 12H5M8 9l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M5 2.5l8 7.2-4.2.7 2.2 3.8-2 1.1-2.1-3.9L4 14l1-11.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        )}
      </span>

      <span className="game-coach-copy">
        <strong style={{ color: theme.textPrimary }}>{message.title}</strong>
        <small style={{ color: theme.textSecondary }}>{message.body}</small>
      </span>

      <Link href="/how-to-play" className="game-coach-link" style={{ color: theme.accent }}>
        Guide
      </Link>
      <button
        type="button"
        className="game-coach-dismiss"
        aria-label="Dismiss game tip"
        style={{ color: theme.textSecondary }}
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
    </aside>
  );
}
