'use client';

import type { PieceChar } from '@raichu/shared-types';
import { preload } from 'react-dom';

interface PieceSVGProps {
  piece: PieceChar;
  size: number;
}

const CDN = 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150';

// Pichu → pawn, Pikachu → rook, Raichu → queen
const PIECE_IMG: Record<string, string> = {
  'w':  `${CDN}/wp.png`,
  'b':  `${CDN}/bp.png`,
  'W':  `${CDN}/wr.png`,
  'B':  `${CDN}/br.png`,
  '@':  `${CDN}/wq.png`,
  '$':  `${CDN}/bq.png`,
};

export function PieceSVG({ piece, size }: PieceSVGProps) {
  const src = PIECE_IMG[piece];
  if (!src) return null;

  // React deduplicates these hints, so every piece type starts downloading at
  // most once and is decoded before it needs to move under the pointer.
  preload(src, { as: 'image' });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <image
        href={src}
        x="0"
        y="0"
        width={size}
        height={size}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}
