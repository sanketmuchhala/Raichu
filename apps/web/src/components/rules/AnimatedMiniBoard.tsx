'use client';

import { useState, useEffect, useRef } from 'react';
import type { PieceChar } from '@raichu/shared-types';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { PieceSVG } from '../pieces/PieceSVG';

const SQ = 40;

export interface AnimPiece {
  piece: PieceChar;
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
}

export interface AnimCapture {
  piece: PieceChar;
  row: number;
  col: number;
}

interface Props {
  gridSize?: number;
  staticPieces?: { row: number; col: number; piece: PieceChar }[];
  animPiece: AnimPiece;
  capture?: AnimCapture;
  caption?: string;
  /** offset the start of the first cycle so multiple boards don't sync */
  phaseOffsetMs?: number;
}

type Phase = 'idle' | 'go' | 'hold' | 'snap';

export function AnimatedMiniBoard({
  gridSize = 5,
  staticPieces = [],
  animPiece,
  capture,
  caption,
  phaseOffsetMs = 0,
}: Props) {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const [phase, setPhase] = useState<Phase>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    function runCycle() {
      setPhase('idle');
      timerRef.current = setTimeout(() => {
        setPhase('go');                                  // start move
        timerRef.current = setTimeout(() => {
          setPhase('hold');                              // arrived
          timerRef.current = setTimeout(() => {
            setPhase('snap');                            // snap back (instant)
            timerRef.current = setTimeout(runCycle, 80);
          }, 700);
        }, 480);
      }, 900);
    }

    timerRef.current = setTimeout(runCycle, phaseOffsetMs);
    return () => clearTimeout(timerRef.current);
  }, [phaseOffsetMs]);

  const atDest  = phase === 'go' || phase === 'hold';
  const moving  = phase === 'go';
  const capGone = phase === 'hold' || phase === 'snap';

  const px = (atDest ? animPiece.toCol : animPiece.fromCol) * SQ + 2;
  const py = (atDest ? animPiece.toRow : animPiece.fromRow) * SQ + 2;

  const boardPx = SQ * gridSize;

  return (
    <div className="inline-flex flex-col items-center">
      <svg
        width={boardPx}
        height={boardPx}
        viewBox={`0 0 ${boardPx} ${boardPx}`}
        style={{ borderRadius: 6, overflow: 'hidden' }}
      >
        {/* Board squares */}
        {Array.from({ length: gridSize * gridSize }, (_, i) => {
          const r = Math.floor(i / gridSize);
          const c = i % gridSize;
          return (
            <rect
              key={`sq-${r}-${c}`}
              x={c * SQ} y={r * SQ}
              width={SQ} height={SQ}
              fill={(r + c) % 2 === 0 ? theme.boardLight : theme.boardDark}
            />
          );
        })}

        {/* Destination highlight */}
        <rect
          x={animPiece.toCol * SQ} y={animPiece.toRow * SQ}
          width={SQ} height={SQ}
          fill={capture ? 'rgba(220,50,50,0.15)' : 'rgba(0,0,0,0.12)'}
        />

        {/* Origin highlight (subtle) */}
        <rect
          x={animPiece.fromCol * SQ} y={animPiece.fromRow * SQ}
          width={SQ} height={SQ}
          fill="rgba(0,0,0,0.08)"
        />

        {/* Static pieces (skip the captured one — rendered separately) */}
        {staticPieces
          .filter((p) => !(capture && p.row === capture.row && p.col === capture.col))
          .map((p, i) => (
            <g key={i} transform={`translate(${p.col * SQ + 2}, ${p.row * SQ + 2})`}>
              <PieceSVG piece={p.piece} size={SQ - 4} />
            </g>
          ))}

        {/* Captured piece — fades out as the attacker arrives */}
        {capture && (
          <g
            transform={`translate(${capture.col * SQ + 2}, ${capture.row * SQ + 2})`}
            style={{
              opacity: capGone ? 0 : 1,
              transition: moving
                ? 'opacity 0.15s ease 0.3s' // start fading 300ms into the move
                : 'none',
            }}
          >
            <PieceSVG piece={capture.piece} size={SQ - 4} />
          </g>
        )}

        {/* Animated piece */}
        <g
          style={{
            transform: `translate(${px}px, ${py}px)`,
            transition: moving ? 'transform 0.48s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        >
          <PieceSVG piece={animPiece.piece} size={SQ - 4} />
        </g>
      </svg>

      {caption && (
        <p className="text-xs mt-2 text-center max-w-[160px]" style={{ color: theme.textSecondary }}>
          {caption}
        </p>
      )}
    </div>
  );
}
