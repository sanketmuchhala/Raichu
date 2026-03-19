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
      {actualType === 'pikachu' && (isWhite ? <WhiteBishop /> : <BlackBishop />)}
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
   BISHOP — Pikachu
   ═══════════════════════════════════════════════════════════ */

function WhiteBishop() {
  return (
    <g>
      {/* Top ball */}
      <circle cx="22.5" cy="6" r="2.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
      {/* Mitre head */}
      <path d="M 18 14 C 18 10 19.5 8 22.5 8 C 25.5 8 27 10 27 14 C 27 17 25 19 22.5 19 C 20 19 18 17 18 14 Z"
        fill="#fff" stroke="#000" strokeWidth="1.5" />
      {/* Mitre slit */}
      <path d="M 22.5 8.5 L 20.5 14 L 22.5 16 L 24.5 14 Z"
        fill="none" stroke="#000" strokeWidth="0.75" />
      {/* Collar */}
      <path d="M 18.5 21 C 18.5 19.5 20 18.5 22.5 18.5 C 25 18.5 26.5 19.5 26.5 21"
        fill="#fff" stroke="#000" strokeWidth="1.5" />
      {/* Body */}
      <path d="M 16.5 29 L 18.5 21 L 26.5 21 L 28.5 29"
        fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Lower collar */}
      <path d="M 14 31 C 14 29 16.5 29 22.5 29 C 28.5 29 31 29 31 31"
        fill="#fff" stroke="#000" strokeWidth="1.5" />
      {/* Base */}
      <path d="M 12.5 36 C 12.5 34 15 32 22.5 32 C 30 32 32.5 34 32.5 36"
        fill="#fff" stroke="#000" strokeWidth="1.5" />
      <path d="M 12.5 36 L 32.5 36" stroke="#000" strokeWidth="1.5" />
      <path d="M 11 38 C 11 36.5 13 35.5 22.5 35.5 C 32 35.5 34 36.5 34 38"
        fill="#fff" stroke="#000" strokeWidth="1.5" />
      <path d="M 11 38 L 34 38" stroke="#000" strokeWidth="1.5" />
    </g>
  );
}

function BlackBishop() {
  return (
    <g>
      <circle cx="22.5" cy="6" r="2.5" fill="#333" stroke="#333" strokeWidth="1.5" />
      <path d="M 18 14 C 18 10 19.5 8 22.5 8 C 25.5 8 27 10 27 14 C 27 17 25 19 22.5 19 C 20 19 18 17 18 14 Z"
        fill="#333" stroke="#333" strokeWidth="1.5" />
      <path d="M 22.5 8.5 L 20.5 14 L 22.5 16 L 24.5 14 Z"
        fill="none" stroke="#e8e8e8" strokeWidth="0.75" opacity="0.5" />
      <path d="M 18.5 21 C 18.5 19.5 20 18.5 22.5 18.5 C 25 18.5 26.5 19.5 26.5 21"
        fill="#333" stroke="#333" strokeWidth="1.5" />
      <path d="M 16.5 29 L 18.5 21 L 26.5 21 L 28.5 29"
        fill="#333" stroke="#333" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M 14 31 C 14 29 16.5 29 22.5 29 C 28.5 29 31 29 31 31"
        fill="#333" stroke="#333" strokeWidth="1.5" />
      <path d="M 12.5 36 C 12.5 34 15 32 22.5 32 C 30 32 32.5 34 32.5 36"
        fill="#333" stroke="#333" strokeWidth="1.5" />
      <path d="M 12.5 36 L 32.5 36" stroke="#333" strokeWidth="1.5" />
      <path d="M 11 38 C 11 36.5 13 35.5 22.5 35.5 C 32 35.5 34 36.5 34 38"
        fill="#333" stroke="#333" strokeWidth="1.5" />
      <path d="M 11 38 L 34 38" stroke="#333" strokeWidth="1.5" />
      {/* Inner line highlights */}
      <path d="M 16.5 29 L 18.5 21 L 26.5 21 L 28.5 29"
        fill="none" stroke="#e8e8e8" strokeWidth="0.75" strokeLinejoin="round" opacity="0.3" />
      <path d="M 14 31 C 14 29 16.5 29 22.5 29 C 28.5 29 31 29 31 31"
        fill="none" stroke="#e8e8e8" strokeWidth="0.75" opacity="0.3" />
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
