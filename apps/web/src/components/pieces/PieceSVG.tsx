'use client';

import type { PieceChar } from '@raichu/shared-types';

interface PieceSVGProps {
  piece: PieceChar;
  size: number;
}

/** Original chess-piece-inspired SVG silhouettes */
export function PieceSVG({ piece, size }: PieceSVGProps) {
  const isWhite = piece === 'w' || piece === 'W' || piece === '@';
  const fill = isWhite ? '#FFFFFF' : '#1a1a1a';
  const stroke = isWhite ? '#1a1a1a' : '#888888';
  const strokeWidth = 1.5;

  const type = piece.toLowerCase() === piece
    ? (piece === '@' || piece === '$' ? 'raichu' : 'pichu')
    : 'pikachu';
  const actualType = piece === '@' || piece === '$' ? 'raichu' : type;

  return (
    <svg width={size} height={size} viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      {actualType === 'pichu' && <PichuShape fill={fill} stroke={stroke} strokeWidth={strokeWidth} />}
      {actualType === 'pikachu' && <PikachuShape fill={fill} stroke={stroke} strokeWidth={strokeWidth} />}
      {actualType === 'raichu' && <RaichuShape fill={fill} stroke={stroke} strokeWidth={strokeWidth} />}
    </svg>
  );
}

/** Pichu — Small pawn-like silhouette with dome head */
function PichuShape({ fill, stroke, strokeWidth }: ShapeProps) {
  return (
    <g>
      {/* Base */}
      <ellipse cx="22.5" cy="39" rx="10" ry="3.5" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {/* Body stem */}
      <path d="M 17 36 L 17 28 Q 17 24 22.5 22 Q 28 24 28 28 L 28 36 Z"
        fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {/* Head */}
      <circle cx="22.5" cy="16" r="7.5" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {/* Top knob */}
      <circle cx="22.5" cy="9" r="2.5" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </g>
  );
}

/** Pikachu — Knight/bishop hybrid with a pointed crest */
function PikachuShape({ fill, stroke, strokeWidth }: ShapeProps) {
  return (
    <g>
      {/* Base */}
      <ellipse cx="22.5" cy="39" rx="11" ry="3.5" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {/* Body */}
      <path d="M 15 36 L 14 27 Q 13 22 16 18 L 16 14 Q 16 9 22.5 6 Q 29 9 29 14 L 29 18 Q 32 22 31 27 L 30 36 Z"
        fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {/* Crest / pointed top */}
      <path d="M 22.5 6 L 19 3 L 22.5 1 L 26 3 Z"
        fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {/* Eye accent */}
      <circle cx="19" cy="17" r="1.5" fill={stroke} />
      <circle cx="26" cy="17" r="1.5" fill={stroke} />
    </g>
  );
}

/** Raichu — Queen-like crown with radiating points on a wide base */
function RaichuShape({ fill, stroke, strokeWidth }: ShapeProps) {
  return (
    <g>
      {/* Base */}
      <ellipse cx="22.5" cy="39" rx="12" ry="4" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {/* Lower body */}
      <path d="M 13 36 L 12 30 L 33 30 L 32 36 Z"
        fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {/* Upper body / collar */}
      <path d="M 14 30 L 15 22 Q 15 18 22.5 16 Q 30 18 30 22 L 31 30 Z"
        fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {/* Crown */}
      <path d="M 15 16 L 10 6 L 16 12 L 18.5 4 L 22.5 11 L 26.5 4 L 29 12 L 35 6 L 30 16 Z"
        fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {/* Crown jewel center */}
      <circle cx="22.5" cy="13" r="2" fill={stroke} />
    </g>
  );
}

interface ShapeProps {
  fill: string;
  stroke: string;
  strokeWidth: number;
}
