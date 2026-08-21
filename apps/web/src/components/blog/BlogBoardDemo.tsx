'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── types ────────────────────────────────────────────────────────────────

interface DemoMove {
  from: [number, number];
  to:   [number, number];
  capture?: [number, number];  // square to clear (may differ from 'to')
  promotion?: string;
}

interface BlogBoardDemoProps {
  /** 64-char row-major board string */
  initialBoard: string;
  /** Sequence of moves to animate, played then looped */
  sequence: DemoMove[];
  caption?: string;
  /** Pixel width of each square (default 52) */
  squareSize?: number;
  /** ms between moves (default 1400) */
  intervalMs?: number;
  /** Flip board so white appears at bottom (default false for diagrams) */
  flipBoard?: boolean;
}

const CDN = 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150';
const IMG: Record<string, string> = {
  w:   `${CDN}/wp.png`,
  b:   `${CDN}/bp.png`,
  W:   `${CDN}/wr.png`,
  B:   `${CDN}/br.png`,
  '@': `${CDN}/wq.png`,
  $:   `${CDN}/bq.png`,
};

const BOARD_LIGHT = '#F0D9B5';
const BOARD_DARK  = '#B58863';
const LAST_MOVE   = 'rgba(255,215,0,0.28)';

// ─── helpers ──────────────────────────────────────────────────────────────

function decode(str: string): string[][] {
  const board: string[][] = [];
  for (let r = 0; r < 8; r++) board.push(str.slice(r * 8, r * 8 + 8).split(''));
  return board;
}

function applyMove(board: string[][], move: DemoMove): string[][] {
  const b = board.map(r => [...r]);
  const piece = move.promotion ?? b[move.from[0]][move.from[1]];
  b[move.from[0]][move.from[1]] = '.';
  if (move.capture) b[move.capture[0]][move.capture[1]] = '.';
  b[move.to[0]][move.to[1]] = piece;
  return b;
}

// ─── component ────────────────────────────────────────────────────────────

export function BlogBoardDemo({
  initialBoard,
  sequence,
  caption,
  squareSize = 52,
  intervalMs = 1500,
  flipBoard = false,
}: BlogBoardDemoProps) {
  // Pre-compute all board states
  const states = useRef<string[][][]>([]);
  useEffect(() => {
    const initial = decode(initialBoard);
    const all: string[][][] = [initial];
    let cur = initial;
    for (const mv of sequence) {
      cur = applyMove(cur, mv);
      all.push(cur);
    }
    states.current = all;
  }, [initialBoard, sequence]);

  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState<{
    piece: string;
    fromRow: number; fromCol: number;
    toRow: number;   toCol: number;
    captureRow?: number; captureCol?: number;
  } | null>(null);
  const [boardDisplay, setBoardDisplay] = useState(() => decode(initialBoard));
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const advance = useCallback(() => {
    if (states.current.length < 2) return;
    const nextStep = (step + 1) % states.current.length;
    const moveIdx  = step % sequence.length;
    const mv       = sequence[moveIdx];
    const currentBoard = states.current[step];
    const piece    = mv.promotion ?? currentBoard[mv.from[0]][mv.from[1]];

    // Start slide animation
    setAnimating({
      piece,
      fromRow: mv.from[0], fromCol: mv.from[1],
      toRow:   mv.to[0],   toCol:   mv.to[1],
      captureRow: mv.capture?.[0],
      captureCol: mv.capture?.[1],
    });

    // After animation completes, commit board state
    timerRef.current = setTimeout(() => {
      setBoardDisplay(states.current[nextStep]);
      setAnimating(null);
      setStep(nextStep);
    }, 480);
  }, [step, sequence]);

  useEffect(() => {
    timerRef.current = setTimeout(advance, step === 0 ? 800 : intervalMs);
    return () => clearTimeout(timerRef.current);
  }, [advance, step, intervalMs]);

  const SQ   = squareSize;
  const BPXW = SQ * 8;
  const BPXH = SQ * 8;

  const dr = (row: number) => flipBoard ? 7 - row : row;
  const dc = (col: number) => flipBoard ? 7 - col : col;

  const lastMv = step > 0 ? sequence[(step - 1 + sequence.length) % sequence.length] : null;

  const isLastMoveSquare = (r: number, c: number) =>
    lastMv && ((lastMv.from[0] === r && lastMv.from[1] === c) || (lastMv.to[0] === r && lastMv.to[1] === c));

  // Animated piece position in SVG coords
  const animFromX = animating ? dc(animating.fromCol) * SQ : 0;
  const animFromY = animating ? dr(animating.fromRow) * SQ : 0;
  const animToX   = animating ? dc(animating.toCol)   * SQ : 0;
  const animToY   = animating ? dr(animating.toRow)   * SQ : 0;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <svg
        width={BPXW}
        height={BPXH}
        viewBox={`0 0 ${BPXW} ${BPXH}`}
        style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.35)', display: 'block' }}
      >
        {/* Squares */}
        {Array.from({ length: 64 }, (_, i) => {
          const r = Math.floor(i / 8);
          const c = i % 8;
          const light = (r + c) % 2 === 0;
          return (
            <rect
              key={`sq-${r}-${c}`}
              x={dc(c) * SQ} y={dr(r) * SQ}
              width={SQ} height={SQ}
              fill={light ? BOARD_LIGHT : BOARD_DARK}
            />
          );
        })}

        {/* Last-move highlights */}
        {lastMv && [lastMv.from, lastMv.to].map(([r, c], i) => (
          <rect
            key={`lm-${i}`}
            x={dc(c) * SQ} y={dr(r) * SQ}
            width={SQ} height={SQ}
            fill={LAST_MOVE}
            pointerEvents="none"
          />
        ))}

        {/* Static pieces */}
        {boardDisplay.map((row, r) =>
          row.map((cell, c) => {
            if (cell === '.') return null;
            // Hide the animating piece from the static layer, and hide captured square
            if (animating) {
              if (r === animating.fromRow && c === animating.fromCol) return null;
              if (r === animating.captureRow && c === animating.captureCol) return null;
              if (r === animating.toRow && c === animating.toCol) return null;
            }
            const src = IMG[cell];
            if (!src) return null;
            return (
              <image
                key={`p-${r}-${c}`}
                href={src}
                x={dc(c) * SQ + 2} y={dr(r) * SQ + 2}
                width={SQ - 4} height={SQ - 4}
              />
            );
          })
        )}

        {/* Sliding piece */}
        {animating && IMG[animating.piece] && (
          <image
            href={IMG[animating.piece]}
            x={animFromX + 2} y={animFromY + 2}
            width={SQ - 4} height={SQ - 4}
            style={{
              transform: `translate(${animToX - animFromX}px, ${animToY - animFromY}px)`,
              transition: 'transform 0.46s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
        )}
      </svg>

      {caption && (
        <p style={{
          fontSize: '0.8125rem',
          color: '#7a7a7a',
          textAlign: 'center',
          maxWidth: BPXW,
          margin: 0,
          fontStyle: 'italic',
        }}>
          {caption}
        </p>
      )}
    </div>
  );
}
