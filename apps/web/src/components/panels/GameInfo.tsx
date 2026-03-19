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
    if (isThinking) return 'Bot is thinking...';
    return `${currentPlayer === 'white' ? 'White' : 'Black'} to move`;
  })();

  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: theme.bgPanel, borderColor: theme.border, borderWidth: 1 }}
    >
      {/* Turn indicator */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-4 h-4 rounded-full border-2"
          style={{
            backgroundColor: currentPlayer === 'white' ? '#fff' : '#1a1a1a',
            borderColor: currentPlayer === 'white' ? '#ccc' : '#444',
          }}
        />
        <span className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
          {statusText}
        </span>
        {isThinking && (
          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: theme.accent }} />
        )}
      </div>

      {/* Game info grid */}
      <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: theme.textSecondary }}>
        <div>Mode</div>
        <div style={{ color: theme.textPrimary }}>
          {gameMode === 'pvp' ? 'Local PvP' : `vs Bot (${difficulty})`}
        </div>
        <div>Move</div>
        <div style={{ color: theme.textPrimary }}>{Math.floor(moveCount / 2) + 1}</div>
      </div>
    </div>
  );
}
