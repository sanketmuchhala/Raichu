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
  replayStep?: number;
  onReplayStep?: (step: number) => void;
}

export function OnlineGameSidebar({ onResign, replayStep, onReplayStep }: OnlineGameSidebarProps) {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const moves = useOnlineGameStore((s) => s.moves);
  const game  = useOnlineGameStore((s) => s.game);

  const isPlaying  = game?.status === 'playing';
  const isFinished = game && game.status !== 'waiting' && game.status !== 'playing';
  const total = moves.length;
  const inReplay = replayStep !== undefined;

  const goFirst = () => onReplayStep?.(0);
  const goPrev  = () => onReplayStep?.(Math.max(0, (replayStep ?? total) - 1));
  const goNext  = () => onReplayStep?.(Math.min(total, (replayStep ?? total) + 1));
  const goLast  = () => onReplayStep?.(total);

  return (
    <div className="flex flex-col gap-3 h-full" style={{ minHeight: 300 }}>
      {/* Move history */}
      <div
        className="flex-1 rounded-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}` }}
      >
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>
            Moves ({moves.length})
          </span>
          {inReplay && (
            <span className="text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: theme.accent + '22', color: theme.accent }}>
              Move {replayStep}/{total}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {moves.length === 0 ? (
            <p className="text-xs py-2" style={{ color: theme.textSecondary }}>
              No moves yet
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {moves.map((move, i) => {
                const isActive = inReplay && replayStep === i + 1;
                return (
                  <div
                    key={move.id}
                    className="flex items-center gap-1.5 cursor-pointer rounded px-1"
                    style={{
                      backgroundColor: isActive ? theme.accent + '22' : 'transparent',
                    }}
                    onClick={() => onReplayStep?.(i + 1)}
                  >
                    {i % 2 === 0 && (
                      <span className="text-[10px] w-4 text-right" style={{ color: theme.textSecondary }}>
                        {Math.floor(i / 2) + 1}.
                      </span>
                    )}
                    <span
                      className="text-xs font-mono"
                      style={{ color: isActive ? theme.accent : theme.textPrimary, fontWeight: isActive ? 700 : 400 }}
                    >
                      {formatMoveShort(move)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Replay controls (shown when game is finished) */}
      {(isFinished || inReplay) && total > 0 && onReplayStep && (
        <div
          className="rounded-xl px-3 py-2 flex items-center justify-between"
          style={{ backgroundColor: theme.bgPanel, border: `1px solid ${theme.border}` }}
        >
          <span className="text-xs" style={{ color: theme.textSecondary }}>Replay</span>
          <div className="flex items-center gap-1">
            {[
              { label: '⏮', action: goFirst, disabled: inReplay && replayStep === 0, title: 'First' },
              { label: '◀', action: goPrev,  disabled: inReplay && replayStep === 0, title: 'Prev' },
              { label: '▶', action: goNext,  disabled: inReplay && replayStep === total, title: 'Next' },
              { label: '⏭', action: goLast,  disabled: inReplay && replayStep === total, title: 'Last' },
            ].map(({ label, action, disabled, title }) => (
              <button
                key={title}
                className="w-7 h-7 rounded flex items-center justify-center text-xs"
                style={{
                  backgroundColor: theme.btnSecondaryBg,
                  color: disabled ? theme.textSecondary + '60' : theme.textSecondary,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
                onClick={action}
                disabled={disabled}
                title={title}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resign button */}
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
