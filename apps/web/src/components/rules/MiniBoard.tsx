'use client';

import type { PieceChar } from '@raichu/shared-types';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { PieceSVG } from '../pieces/PieceSVG';

interface CellHighlight {
  row: number;
  col: number;
  type: 'move' | 'capture' | 'selected';
}

interface CellPiece {
  row: number;
  col: number;
  piece: PieceChar;
}

interface MiniBoardProps {
  gridSize?: number;
  pieces: CellPiece[];
  highlights?: CellHighlight[];
  caption?: string;
}

const SQ = 40; // square size in SVG units

export function MiniBoard({ gridSize = 5, pieces, highlights = [], caption }: MiniBoardProps) {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const boardPx = SQ * gridSize;

  return (
    <div className="inline-flex flex-col items-center">
      <svg
        width={boardPx}
        height={boardPx}
        viewBox={`0 0 ${boardPx} ${boardPx}`}
        style={{ borderRadius: 6, overflow: 'hidden' }}
      >
        {/* Squares */}
        {Array.from({ length: gridSize * gridSize }, (_, i) => {
          const r = Math.floor(i / gridSize);
          const c = i % gridSize;
          const isLight = (r + c) % 2 === 0;
          return (
            <rect
              key={`sq-${r}-${c}`}
              x={c * SQ}
              y={r * SQ}
              width={SQ}
              height={SQ}
              fill={isLight ? theme.boardLight : theme.boardDark}
            />
          );
        })}

        {/* Highlights */}
        {highlights.map((h, i) => {
          const cx = h.col * SQ + SQ / 2;
          const cy = h.row * SQ + SQ / 2;

          if (h.type === 'selected') {
            return (
              <rect
                key={`hl-${i}`}
                x={h.col * SQ}
                y={h.row * SQ}
                width={SQ}
                height={SQ}
                fill="rgba(255, 255, 0, 0.4)"
              />
            );
          }
          if (h.type === 'move') {
            return (
              <circle
                key={`hl-${i}`}
                cx={cx}
                cy={cy}
                r={6}
                fill="rgba(0, 0, 0, 0.25)"
              />
            );
          }
          if (h.type === 'capture') {
            return (
              <circle
                key={`hl-${i}`}
                cx={cx}
                cy={cy}
                r={SQ / 2 - 3}
                fill="none"
                stroke="rgba(255, 0, 0, 0.5)"
                strokeWidth={3}
              />
            );
          }
          return null;
        })}

        {/* Pieces */}
        {pieces.map((p, i) => (
          <g key={`piece-${i}`} transform={`translate(${p.col * SQ + 2}, ${p.row * SQ + 2})`}>
            <PieceSVG piece={p.piece} size={SQ - 4} />
          </g>
        ))}
      </svg>
      {caption && (
        <p className="text-xs mt-2 text-center" style={{ color: theme.textSecondary }}>
          {caption}
        </p>
      )}
    </div>
  );
}
