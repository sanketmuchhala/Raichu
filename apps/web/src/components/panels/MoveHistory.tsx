'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/game-store';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { formatMoveHuman, formatMoveCoordinate } from '@raichu/game-engine';

export function MoveHistory() {
  const moveHistory = useGameStore((s) => s.moveHistory);
  const theme = useUIStore((s) => THEMES[s.theme]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showCoordinates, setShowCoordinates] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory.length]);

  return (
    <div
      className="rounded-lg flex flex-col"
      style={{ backgroundColor: theme.bgPanel, borderColor: theme.border, borderWidth: 1 }}
    >
      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: theme.border }}>
        <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
          Move History
        </span>
        <button
          className="text-xs px-2 py-1 rounded"
          style={{ color: theme.textSecondary, backgroundColor: theme.bgSecondary }}
          onClick={() => setShowCoordinates(!showCoordinates)}
        >
          {showCoordinates ? 'Human' : 'Coords'}
        </button>
      </div>

      <div
        ref={scrollRef}
        className="overflow-y-auto p-2 max-h-64"
        style={{ minHeight: 100 }}
      >
        {moveHistory.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: theme.textSecondary }}>
            No moves yet
          </p>
        ) : (
          <div className="space-y-0.5">
            {/* Group moves into pairs (white, black) */}
            {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
              const whiteMove = moveHistory[i * 2];
              const blackMove = moveHistory[i * 2 + 1];
              const format = showCoordinates ? formatMoveCoordinate : formatMoveHuman;

              return (
                <div key={i} className="flex text-sm font-mono" style={{ color: theme.textPrimary }}>
                  <span className="w-8 shrink-0" style={{ color: theme.textSecondary }}>
                    {i + 1}.
                  </span>
                  <span className="flex-1 truncate px-1">{format(whiteMove)}</span>
                  {blackMove && (
                    <span className="flex-1 truncate px-1">{format(blackMove)}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
