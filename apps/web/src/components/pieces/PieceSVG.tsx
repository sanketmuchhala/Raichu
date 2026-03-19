'use client';

import type { PieceChar } from '@raichu/shared-types';

interface PieceSVGProps {
  piece: PieceChar;
  size: number;
}

export function PieceSVG({ piece, size }: PieceSVGProps) {
  const isWhite = piece === 'w' || piece === 'W' || piece === '@';
  const fill = isWhite ? '#F8F8F8' : '#222222';
  const stroke = isWhite ? '#333333' : '#AAAAAA';

  const actualType =
    piece === '@' || piece === '$'
      ? 'raichu'
      : piece === 'W' || piece === 'B'
        ? 'pikachu'
        : 'pichu';

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      {actualType === 'pichu' && <PichuShape fill={fill} stroke={stroke} />}
      {actualType === 'pikachu' && <PikachuShape fill={fill} stroke={stroke} />}
      {actualType === 'raichu' && <RaichuShape fill={fill} stroke={stroke} />}
    </svg>
  );
}

/** Pichu — simple disc, like a checkers piece */
function PichuShape({ fill, stroke }: ShapeProps) {
  return (
    <circle
      cx="20"
      cy="20"
      r="12"
      fill={fill}
      stroke={stroke}
      strokeWidth="2"
    />
  );
}

/** Pikachu — hexagon, clearly distinct from Pichu */
function PikachuShape({ fill, stroke }: ShapeProps) {
  return (
    <polygon
      points="20,5 33,12.5 33,27.5 20,35 7,27.5 7,12.5"
      fill={fill}
      stroke={stroke}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  );
}

/** Raichu — star/crown shape, the most powerful piece */
function RaichuShape({ fill, stroke }: ShapeProps) {
  return (
    <polygon
      points="20,3 24.5,14 36,14 27,22 30.5,33 20,26 9.5,33 13,22 4,14 15.5,14"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  );
}

interface ShapeProps {
  fill: string;
  stroke: string;
}
