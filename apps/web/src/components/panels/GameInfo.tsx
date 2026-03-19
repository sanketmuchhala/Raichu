'use client';

import { useGameStore } from '../../store/game-store';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';

export function GameInfo() {
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const status = useGameStore((s) => s.status);
  const gameMode = useGameStore((s) => s.gameMode);
  const difficulty = useGameStore((s) => s.difficulty);
  const isThinking = useGameStore((s) => s.isThinking);
  const moveCount = useGameStore((s) => s.moveHistory.length);
  const theme = useUIStore((s) => THEMES[s.theme]);

  const statusText = (() => {
    if (status === 'white_wins') return 'White wins!';
    if (status === 'black_wins') return 'Black wins!';
    if (isThinking) return 'Thinking…';
    return `${currentPlayer === 'white' ? 'White' : 'Black'} to move`;
  })();

  const isGameOver = status !== 'playing';

  return (
    <div
      className="panel-card p-3 lg:p-4"
      style={{
        backgroundColor: theme.bgPanel,
        borderColor: theme.border,
        boxShadow: `0 2px 8px ${theme.shadow}`,
      }}
    >
      {/* Turn indicator */}
      <div className="flex items-center gap-3 mb-2 lg:mb-3">
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: currentPlayer === 'white' ? '#fff' : '#1a1a1a',
            border: `2px solid ${currentPlayer === 'white' ? '#aaa' : '#555'}`,
            boxShadow: isGameOver
              ? `0 0 8px ${theme.accent}60`
              : `0 0 6px ${currentPlayer === 'white' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)'}`,
            flexShrink: 0,
          }}
        />
        <span
          className="font-semibold"
          style={{
            color: isGameOver ? theme.accent : theme.textPrimary,
            fontSize: '1rem',
          }}
        >
          {statusText}
        </span>
        {isThinking && (
          <div
            className="animate-spin"
            style={{
              width: 14,
              height: 14,
              border: `2px solid ${theme.border}`,
              borderTopColor: theme.accent,
              borderRadius: '50%',
              flexShrink: 0,
            }}
          />
        )}
      </div>

      {/* Game info row */}
      <div className="flex gap-4 text-xs" style={{ color: theme.textSecondary }}>
        <div className="flex items-center gap-1.5">
          <span>Mode</span>
          <span className="font-semibold" style={{ color: theme.textPrimary }}>
            {gameMode === 'pvp' ? 'PvP' : `Bot (${difficulty})`}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Move</span>
          <span className="font-semibold" style={{ color: theme.textPrimary }}>
            {Math.floor(moveCount / 2) + 1}
          </span>
        </div>
      </div>
    </div>
  );
}
