'use client';

import type { PieceChar } from '@raichu/shared-types';

interface PieceSVGProps {
  piece: PieceChar;
  size: number;
}

export function PieceSVG({ piece, size }: PieceSVGProps) {
  const isWhite = piece === 'w' || piece === 'W' || piece === '@';
  const fill = isWhite ? '#FFFFFF' : '#1a1a1a';
  const stroke = isWhite ? '#1a1a1a' : '#777777';

  const actualType =
    piece === '@' || piece === '$'
      ? 'raichu'
      : piece === 'W' || piece === 'B'
        ? 'pikachu'
        : 'pichu';

  return (
    <svg width={size} height={size} viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      {actualType === 'pichu' && <PichuShape fill={fill} stroke={stroke} />}
      {actualType === 'pikachu' && <PikachuShape fill={fill} stroke={stroke} />}
      {actualType === 'raichu' && <RaichuShape fill={fill} stroke={stroke} />}
    </svg>
  );
}

/** Pichu — chess pawn: round head, tapered neck, flared base */
function PichuShape({ fill, stroke }: ShapeProps) {
  return (
    <path
      d="M 22.5 8 C 18.5 8 15.5 11 15.5 14.5 C 15.5 17 17 19 19 20
         L 17 28 C 17 28 14 30 14 33 L 14 36 L 31 36 L 31 33
         C 31 30 28 28 28 28 L 26 20
         C 28 19 29.5 17 29.5 14.5 C 29.5 11 26.5 8 22.5 8 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  );
}

/** Pikachu — chess bishop: tall mitre with slit, tapered body */
function PikachuShape({ fill, stroke }: ShapeProps) {
  return (
    <path
      d="M 22.5 5 C 22.5 5 18 10 18 15 C 18 18 20 20 20 20
         L 17 28 C 17 28 13 30 13 33 L 13 36 L 32 36 L 32 33
         C 32 30 28 28 28 28 L 25 20
         C 25 20 27 18 27 15 C 27 10 22.5 5 22.5 5 Z
         M 20.5 12 L 24.5 12"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  );
}

/** Raichu — chess queen: crown with 5 points, body, wide base */
function RaichuShape({ fill, stroke }: ShapeProps) {
  return (
    <g>
      <path
        d="M 9 36 L 9 33 C 9 30 13 28 13 28 L 15 20
           L 9 8 L 16 16 L 22.5 5 L 29 16 L 36 8
           L 30 20 L 32 28
           C 32 28 36 30 36 33 L 36 36 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="2" fill={fill} stroke={stroke} strokeWidth="1" />
      <circle cx="22.5" cy="4" r="2" fill={fill} stroke={stroke} strokeWidth="1" />
      <circle cx="36" cy="7" r="2" fill={fill} stroke={stroke} strokeWidth="1" />
    </g>
  );
}

interface ShapeProps {
  fill: string;
  stroke: string;
}
