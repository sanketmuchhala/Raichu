'use client';

import type { PieceChar } from '@raichu/shared-types';

interface PieceSVGProps {
  piece: PieceChar;
  size: number;
}

export function PieceSVG({ piece, size }: PieceSVGProps) {
  const isWhite = piece === 'w' || piece === 'W' || piece === '@';

  const actualType =
    piece === '@' || piece === '$'
      ? 'raichu'
      : piece === 'W' || piece === 'B'
        ? 'pikachu'
        : 'pichu';

  return (
    <svg width={size} height={size} viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      {actualType === 'pichu' && (isWhite ? <WhitePawn /> : <BlackPawn />)}
      {actualType === 'pikachu' && (isWhite ? <WhiteRook /> : <BlackRook />)}
      {actualType === 'raichu' && (isWhite ? <WhiteQueen /> : <BlackQueen />)}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAWN — Pichu
   ═══════════════════════════════════════════════════════════ */

function WhitePawn() {
  return (
    <g>
      {/* Head */}
      <circle cx="22.5" cy="12" r="5.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
      {/* Collar */}
      <path d="M 17.5 19 C 17.5 17 19.5 15.5 22.5 15.5 C 25.5 15.5 27.5 17 27.5 19"
        fill="none" stroke="#000" strokeWidth="1.5" />
      {/* Body */}
      <path d="M 17.5 19 L 15.5 27 L 29.5 27 L 27.5 19"
        fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Lower ring */}
      <path d="M 14 30 C 14 28 15.5 27 22.5 27 C 29.5 27 31 28 31 30 C 31 28 29.5 27 22.5 27 C 15.5 27 14 28 14 30 Z"
        fill="#fff" stroke="#000" strokeWidth="1.5" />
      {/* Base */}
      <path d="M 12 36 C 12 34.5 14 31 22.5 31 C 31 31 33 34.5 33 36"
        fill="#fff" stroke="#000" strokeWidth="1.5" />
      <path d="M 12 36 L 33 36" stroke="#000" strokeWidth="1.5" />
      {/* Base bottom line */}
      <path d="M 11 38 C 11 36.5 13 35.5 22.5 35.5 C 32 35.5 34 36.5 34 38"
        fill="#fff" stroke="#000" strokeWidth="1.5" />
      <path d="M 11 38 L 34 38" stroke="#000" strokeWidth="1.5" />
    </g>
  );
}

function BlackPawn() {
  return (
    <g>
      <circle cx="22.5" cy="12" r="5.5" fill="#333" stroke="#333" strokeWidth="1.5" />
      <path d="M 17.5 19 C 17.5 17 19.5 15.5 22.5 15.5 C 25.5 15.5 27.5 17 27.5 19"
        fill="none" stroke="#333" strokeWidth="1.5" />
      <path d="M 17.5 19 L 15.5 27 L 29.5 27 L 27.5 19"
        fill="#333" stroke="#333" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M 14 30 C 14 28 15.5 27 22.5 27 C 29.5 27 31 28 31 30 C 31 28 29.5 27 22.5 27 C 15.5 27 14 28 14 30 Z"
        fill="#333" stroke="#333" strokeWidth="1.5" />
      <path d="M 12 36 C 12 34.5 14 31 22.5 31 C 31 31 33 34.5 33 36"
        fill="#333" stroke="#333" strokeWidth="1.5" />
      <path d="M 12 36 L 33 36" stroke="#333" strokeWidth="1.5" />
      <path d="M 11 38 C 11 36.5 13 35.5 22.5 35.5 C 32 35.5 34 36.5 34 38"
        fill="#333" stroke="#333" strokeWidth="1.5" />
      <path d="M 11 38 L 34 38" stroke="#333" strokeWidth="1.5" />
      {/* Light inner highlights */}
      <path d="M 17.5 19 L 15.5 27 L 29.5 27 L 27.5 19"
        fill="none" stroke="#e8e8e8" strokeWidth="0.75" strokeLinejoin="round" opacity="0.3" />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOK — Pikachu
   ═══════════════════════════════════════════════════════════ */

function WhiteRook() {
  return (
    <g>
      {/* Battlements (crenellations) */}
      <path d="M 9 11 L 9 6 L 13 6 L 13 9 L 17 9 L 17 6 L 21 6 L 21 9 L 24 9 L 24 6 L 28 6 L 28 9 L 32 9 L 32 6 L 36 6 L 36 11"
        fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Top horizontal bar */}
      <path d="M 9 11 L 36 11" fill="none" stroke="#000" strokeWidth="1.5" />
      {/* Neck */}
      <path d="M 13 11 L 15 15 L 30 15 L 32 11"
        fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Body shaft */}
      <path d="M 14 15 L 12 29 L 33 29 L 31 15"
        fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Horizontal body line */}
      <path d="M 14 16.5 L 31 16.5" fill="none" stroke="#000" strokeWidth="1" />
      <path d="M 12.5 28 L 32.5 28" fill="none" stroke="#000" strokeWidth="1" />
      {/* Lower collar */}
      <path d="M 10 32 C 10 30 12 29 22.5 29 C 33 29 35 30 35 32"
        fill="#fff" stroke="#000" strokeWidth="1.5" />
      {/* Base */}
      <path d="M 9 36 C 9 34.5 11 33 22.5 33 C 34 33 36 34.5 36 36"
        fill="#fff" stroke="#000" strokeWidth="1.5" />
      <path d="M 9 36 L 36 36" stroke="#000" strokeWidth="1.5" />
      <path d="M 8 39 C 8 37.5 10.5 36.5 22.5 36.5 C 34.5 36.5 37 37.5 37 39"
        fill="#fff" stroke="#000" strokeWidth="1.5" />
      <path d="M 8 39 L 37 39" stroke="#000" strokeWidth="1.5" />
    </g>
  );
}

function BlackRook() {
  return (
    <g>
      {/* Battlements (crenellations) */}
      <path d="M 9 11 L 9 6 L 13 6 L 13 9 L 17 9 L 17 6 L 21 6 L 21 9 L 24 9 L 24 6 L 28 6 L 28 9 L 32 9 L 32 6 L 36 6 L 36 11"
        fill="#333" stroke="#333" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Top horizontal bar */}
      <path d="M 9 11 L 36 11" fill="none" stroke="#333" strokeWidth="1.5" />
      {/* Neck */}
      <path d="M 13 11 L 15 15 L 30 15 L 32 11"
        fill="#333" stroke="#333" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Body shaft */}
      <path d="M 14 15 L 12 29 L 33 29 L 31 15"
        fill="#333" stroke="#333" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Horizontal body highlights */}
      <path d="M 14 16.5 L 31 16.5" fill="none" stroke="#e8e8e8" strokeWidth="0.75" opacity="0.35" />
      <path d="M 12.5 28 L 32.5 28" fill="none" stroke="#e8e8e8" strokeWidth="0.75" opacity="0.35" />
      {/* Lower collar */}
      <path d="M 10 32 C 10 30 12 29 22.5 29 C 33 29 35 30 35 32"
        fill="#333" stroke="#333" strokeWidth="1.5" />
      {/* Base */}
      <path d="M 9 36 C 9 34.5 11 33 22.5 33 C 34 33 36 34.5 36 36"
        fill="#333" stroke="#333" strokeWidth="1.5" />
      <path d="M 9 36 L 36 36" stroke="#333" strokeWidth="1.5" />
      <path d="M 8 39 C 8 37.5 10.5 36.5 22.5 36.5 C 34.5 36.5 37 37.5 37 39"
        fill="#333" stroke="#333" strokeWidth="1.5" />
      <path d="M 8 39 L 37 39" stroke="#333" strokeWidth="1.5" />
      {/* Inner body highlight */}
      <path d="M 14 15 L 12 29 L 33 29 L 31 15"
        fill="none" stroke="#e8e8e8" strokeWidth="0.75" strokeLinejoin="round" opacity="0.3" />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════
   QUEEN — Raichu
   ═══════════════════════════════════════════════════════════ */

function WhiteQueen() {
  return (
    <g>
      {/* Crown tip balls */}
      <circle cx="9" cy="8" r="2" fill="#fff" stroke="#000" strokeWidth="1" />
      <circle cx="15" cy="5" r="2" fill="#fff" stroke="#000" strokeWidth="1" />
      <circle cx="22.5" cy="3.5" r="2" fill="#fff" stroke="#000" strokeWidth="1" />
      <circle cx="30" cy="5" r="2" fill="#fff" stroke="#000" strokeWidth="1" />
      <circle cx="36" cy="8" r="2" fill="#fff" stroke="#000" strokeWidth="1" />
      {/* Crown spikes + body */}
      <path d="M 9 9 L 11.5 20 L 7.5 23
               L 15 18 L 14 25
               L 22.5 16 L 22.5 25
               L 31 18 L 30 25
               L 37.5 23 L 33.5 20 L 36 9
               L 33 15 L 30 7 L 22.5 5.5 L 15 7 L 12 15 Z"
        fill="#fff" stroke="#000" strokeWidth="1" strokeLinejoin="round" />
      {/* Body middle */}
      <path d="M 7 28 C 7 26 10 25 22.5 25 C 35 25 38 26 38 28"
        fill="#fff" stroke="#000" strokeWidth="1.5" />
      {/* Body lower */}
      <path d="M 7 28 L 10 32 L 35 32 L 38 28"
        fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Inner crown line pattern */}
      <path d="M 11 26 L 11.5 20" fill="none" stroke="#000" strokeWidth="0.75" />
      <path d="M 17 26 L 14 25" fill="none" stroke="#000" strokeWidth="0.75" />
      <path d="M 22.5 26 L 22.5 25" fill="none" stroke="#000" strokeWidth="0.75" />
      <path d="M 28 26 L 31 25" fill="none" stroke="#000" strokeWidth="0.75" />
      <path d="M 34 26 L 33.5 20" fill="none" stroke="#000" strokeWidth="0.75" />
      {/* Base */}
      <path d="M 10 36 C 10 34.5 12 33 22.5 33 C 33 33 35 34.5 35 36"
        fill="#fff" stroke="#000" strokeWidth="1.5" />
      <path d="M 10 36 L 35 36" stroke="#000" strokeWidth="1.5" />
      <path d="M 9 39 C 9 37.5 11.5 36.5 22.5 36.5 C 33.5 36.5 36 37.5 36 39"
        fill="#fff" stroke="#000" strokeWidth="1.5" />
      <path d="M 9 39 L 36 39" stroke="#000" strokeWidth="1.5" />
    </g>
  );
}

function BlackQueen() {
  return (
    <g>
      <circle cx="9" cy="8" r="2" fill="#333" stroke="#333" strokeWidth="1" />
      <circle cx="15" cy="5" r="2" fill="#333" stroke="#333" strokeWidth="1" />
      <circle cx="22.5" cy="3.5" r="2" fill="#333" stroke="#333" strokeWidth="1" />
      <circle cx="30" cy="5" r="2" fill="#333" stroke="#333" strokeWidth="1" />
      <circle cx="36" cy="8" r="2" fill="#333" stroke="#333" strokeWidth="1" />
      <path d="M 9 9 L 11.5 20 L 7.5 23
               L 15 18 L 14 25
               L 22.5 16 L 22.5 25
               L 31 18 L 30 25
               L 37.5 23 L 33.5 20 L 36 9
               L 33 15 L 30 7 L 22.5 5.5 L 15 7 L 12 15 Z"
        fill="#333" stroke="#333" strokeWidth="1" strokeLinejoin="round" />
      <path d="M 7 28 C 7 26 10 25 22.5 25 C 35 25 38 26 38 28"
        fill="#333" stroke="#333" strokeWidth="1.5" />
      <path d="M 7 28 L 10 32 L 35 32 L 38 28"
        fill="#333" stroke="#333" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Light inner lines for depth */}
      <path d="M 11 26 L 11.5 20" fill="none" stroke="#e8e8e8" strokeWidth="0.75" opacity="0.35" />
      <path d="M 17 26 L 14 25" fill="none" stroke="#e8e8e8" strokeWidth="0.75" opacity="0.35" />
      <path d="M 22.5 26 L 22.5 25" fill="none" stroke="#e8e8e8" strokeWidth="0.75" opacity="0.35" />
      <path d="M 28 26 L 31 25" fill="none" stroke="#e8e8e8" strokeWidth="0.75" opacity="0.35" />
      <path d="M 34 26 L 33.5 20" fill="none" stroke="#e8e8e8" strokeWidth="0.75" opacity="0.35" />
      <path d="M 10 36 C 10 34.5 12 33 22.5 33 C 33 33 35 34.5 35 36"
        fill="#333" stroke="#333" strokeWidth="1.5" />
      <path d="M 10 36 L 35 36" stroke="#333" strokeWidth="1.5" />
      <path d="M 9 39 C 9 37.5 11.5 36.5 22.5 36.5 C 33.5 36.5 36 37.5 36 39"
        fill="#333" stroke="#333" strokeWidth="1.5" />
      <path d="M 9 39 L 36 39" stroke="#333" strokeWidth="1.5" />
      {/* Highlight on body and base */}
      <path d="M 7 28 L 10 32 L 35 32 L 38 28"
        fill="none" stroke="#e8e8e8" strokeWidth="0.75" strokeLinejoin="round" opacity="0.3" />
    </g>
  );
}
