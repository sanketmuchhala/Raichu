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
      className="panel-card flex flex-col flex-1 min-h-0"
      style={{
        backgroundColor: theme.bgPanel,
        borderColor: theme.border,
        boxShadow: `0 2px 8px ${theme.shadow}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${theme.border}` }}
      >
        <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
          Move History
        </span>
        <button
          className="text-xs px-2.5 py-1 rounded-md font-medium"
          style={{
            color: theme.textSecondary,
            backgroundColor: theme.btnSecondaryBg,
            transition: 'background-color 150ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryBg)}
          onClick={() => setShowCoordinates(!showCoordinates)}
        >
          {showCoordinates ? 'Human' : 'Coords'}
        </button>
      </div>

      {/* Move list */}
      <div
        ref={scrollRef}
        className="overflow-y-auto flex-1 px-2 py-1.5 custom-scroll"
      >
        {moveHistory.length === 0 ? (
          <p
            className="text-sm text-center py-6"
            style={{ color: theme.textSecondary }}
          >
            No moves yet
          </p>
        ) : (
          <div className="space-y-px">
            {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
              const whiteMove = moveHistory[i * 2];
              const blackMove = moveHistory[i * 2 + 1];
              const format = showCoordinates ? formatMoveCoordinate : formatMoveHuman;

              return (
                <div
                  key={i}
                  className="flex text-sm font-mono rounded-md px-2 py-1"
                  style={{
                    color: theme.textPrimary,
                    backgroundColor: i % 2 === 0 ? 'transparent' : theme.bgSecondary + '60',
                  }}
                >
                  <span
                    className="w-8 shrink-0 font-medium"
                    style={{ color: theme.textSecondary }}
                  >
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
