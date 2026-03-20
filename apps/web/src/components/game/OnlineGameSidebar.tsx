'use client';

import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { useOnlineGameStore } from '../../store/online-game-store';

const COL_LABELS = 'abcdefgh';

function formatMoveShort(move: { from_row: number; from_col: number; to_row: number; to_col: number; captured_piece: string | null }) {
  const from = `${COL_LABELS[move.from_col]}${8 - move.from_row}`;
  const to = `${COL_LABELS[move.to_col]}${8 - move.to_row}`;
  const sep = move.captured_piece ? 'x' : '-';
  return `${from}${sep}${to}`;
}

interface OnlineGameSidebarProps {
  onResign: () => void;
}

export function OnlineGameSidebar({ onResign }: OnlineGameSidebarProps) {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const moves = useOnlineGameStore((s) => s.moves);
  const game = useOnlineGameStore((s) => s.game);

  const isPlaying = game?.status === 'playing';

  return (
    <div
      className="flex flex-col gap-3 h-full"
      style={{ minHeight: 300 }}
    >
      {/* Move history */}
      <div
        className="flex-1 rounded-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}` }}
      >
        <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>
            Moves ({moves.length})
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {moves.length === 0 ? (
            <p className="text-xs py-2" style={{ color: theme.textSecondary }}>
              No moves yet
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {moves.map((move, i) => (
                <div key={move.id} className="flex items-center gap-1.5">
                  {i % 2 === 0 && (
                    <span className="text-[10px] w-4 text-right" style={{ color: theme.textSecondary }}>
                      {Math.floor(i / 2) + 1}.
                    </span>
                  )}
                  <span className="text-xs font-mono" style={{ color: theme.textPrimary }}>
                    {formatMoveShort(move)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      {isPlaying && (
        <button
          onClick={onResign}
          className="w-full py-2 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
          style={{ backgroundColor: theme.bgSecondary, color: theme.textSecondary, border: `1px solid ${theme.border}` }}
        >
          Resign
        </button>
      )}
    </div>
  );
}
