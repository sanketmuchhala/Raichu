'use client';

import type { PieceChar } from '@raichu/shared-types';

const CDN = 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150';
const PIECE_IMG: Record<string, string> = {
  w: `${CDN}/wp.png`,
  b: `${CDN}/bp.png`,
  W: `${CDN}/wr.png`,
  B: `${CDN}/br.png`,
  '@': `${CDN}/wq.png`,
  $: `${CDN}/bq.png`,
};

// Sort order: Pichus first, Pikachus, Raichupromoted last
const SORT_ORDER: Record<string, number> = { w: 0, b: 0, W: 1, B: 1, '@': 2, $: 2 };

interface CapturedPiecesProps {
  pieces: PieceChar[];
  size?: number;
}

export function CapturedPieces({ pieces, size = 22 }: CapturedPiecesProps) {
  const sorted = [...pieces].sort((a, b) => (SORT_ORDER[a] ?? 0) - (SORT_ORDER[b] ?? 0));

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        minHeight: size + 4,
        paddingLeft: 4,
        paddingRight: 4,
      }}
    >
      {sorted.map((p, i) => (
        <img
          key={i}
          src={PIECE_IMG[p]}
          alt={p}
          width={size}
          height={size}
          style={{ opacity: 0.78, display: 'block' }}
          draggable={false}
        />
      ))}
    </div>
  );
}
