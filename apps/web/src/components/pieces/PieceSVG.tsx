'use client';

import type { PieceChar } from '@raichu/shared-types';

interface PieceSVGProps {
  piece: PieceChar;
  size: number;
}

/* ─────────────────────────────────────────────────────────────
   Color constants
   White pieces  → warm ivory fill, near-black stroke
   Black pieces  → near-black fill, warm cream stroke
   The contrast stroke is the fix: black pieces had fill=stroke=#333
   which made them invisible on dark board squares.
───────────────────────────────────────────────────────────── */
const W_FILL   = '#F0E8D0';
const W_STROKE = '#1a1208';
const B_FILL   = '#1e1e1e';
const B_STROKE = '#ccc0a0'; // warm cream — visible on all board squares

export function PieceSVG({ piece, size }: PieceSVGProps) {
  const isWhite = piece === 'w' || piece === 'W' || piece === '@';
  const f = isWhite ? W_FILL   : B_FILL;
  const s = isWhite ? W_STROKE : B_STROKE;

  const type =
    piece === '@' || piece === '$' ? 'raichu'  :
    piece === 'W' || piece === 'B' ? 'pikachu' : 'pichu';

  return (
    <svg width={size} height={size} viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
      {type === 'pichu'   && <Pawn  f={f} s={s} />}
      {type === 'pikachu' && <Rook  f={f} s={s} />}
      {type === 'raichu'  && <Queen f={f} s={s} />}
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   PAWN — Pichu
   Classic Staunton-inspired pawn silhouette
═══════════════════════════════════════════════ */
function Pawn({ f, s }: { f: string; s: string }) {
  return (
    <g>
      {/* Ball head */}
      <circle cx="22.5" cy="11" r="6" fill={f} stroke={s} strokeWidth="1.5" />
      {/* Collar arc below head */}
      <path d="M 18 18 C 18 16 20 14.5 22.5 14.5 C 25 14.5 27 16 27 18"
        fill="none" stroke={s} strokeWidth="1.5" />
      {/* Body */}
      <path d="M 17.5 18 L 15.5 27 L 29.5 27 L 27.5 18 Z"
        fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Lower ring */}
      <path d="M 14 30.5 C 14 28.5 15.5 27.5 22.5 27.5 C 29.5 27.5 31 28.5 31 30.5"
        fill={f} stroke={s} strokeWidth="1.5" />
      <path d="M 14 30.5 L 14 33 L 31 33 L 31 30.5"
        fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Base */}
      <path d="M 11 38 C 11 36 13.5 34.5 22.5 34.5 C 31.5 34.5 34 36 34 38"
        fill={f} stroke={s} strokeWidth="1.5" />
      <line x1="11" y1="38" x2="34" y2="38" stroke={s} strokeWidth="1.5" />
    </g>
  );
}

/* ═══════════════════════════════════════════════
   ROOK — Pikachu
   Castle tower with crenellated battlements
═══════════════════════════════════════════════ */
function Rook({ f, s }: { f: string; s: string }) {
  return (
    <g>
      {/* Battlements */}
      <path d="M 9 12 L 9 6 L 13 6 L 13 10 L 17 10 L 17 6 L 21 6 L 21 10 L 24 10 L 24 6 L 28 6 L 28 10 L 32 10 L 32 6 L 36 6 L 36 12"
        fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Battlement top bar */}
      <line x1="9" y1="12" x2="36" y2="12" stroke={s} strokeWidth="1.5" />
      {/* Tower taper */}
      <path d="M 13 12 L 15 15.5 L 30 15.5 L 32 12"
        fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Tower body */}
      <path d="M 14.5 15.5 L 12.5 29 L 32.5 29 L 30.5 15.5 Z"
        fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Inner detail lines */}
      <line x1="15" y1="17" x2="30" y2="17" stroke={s} strokeWidth="0.9" opacity="0.5" />
      <line x1="13" y1="28" x2="32" y2="28" stroke={s} strokeWidth="0.9" opacity="0.5" />
      {/* Lower collar */}
      <path d="M 10 32.5 C 10 30.5 12 29.5 22.5 29.5 C 33 29.5 35 30.5 35 32.5"
        fill={f} stroke={s} strokeWidth="1.5" />
      <path d="M 10 32.5 L 10 35.5 L 35 35.5 L 35 32.5"
        fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Base */}
      <path d="M 8 39.5 C 8 37.5 10.5 36.5 22.5 36.5 C 34.5 36.5 37 37.5 37 39.5"
        fill={f} stroke={s} strokeWidth="1.5" />
      <line x1="8" y1="39.5" x2="37" y2="39.5" stroke={s} strokeWidth="1.5" />
    </g>
  );
}

/* ═══════════════════════════════════════════════
   QUEEN — Raichu
   Five-pointed crown, most imposing piece
═══════════════════════════════════════════════ */
function Queen({ f, s }: { f: string; s: string }) {
  return (
    <g>
      {/* Crown tip balls */}
      <circle cx="9"    cy="8"   r="2.25" fill={f} stroke={s} strokeWidth="1.25" />
      <circle cx="15"   cy="5"   r="2.25" fill={f} stroke={s} strokeWidth="1.25" />
      <circle cx="22.5" cy="3.5" r="2.25" fill={f} stroke={s} strokeWidth="1.25" />
      <circle cx="30"   cy="5"   r="2.25" fill={f} stroke={s} strokeWidth="1.25" />
      <circle cx="36"   cy="8"   r="2.25" fill={f} stroke={s} strokeWidth="1.25" />
      {/* Crown body + spikes */}
      <path d="M 9 10 L 12 20 L 8 23
               L 15 18 L 14 25
               L 22.5 17 L 22.5 25
               L 31 18 L 30 25
               L 37 23 L 33 20 L 36 10
               L 33 15.5 L 30 7 L 22.5 5.5 L 15 7 L 12 15.5 Z"
        fill={f} stroke={s} strokeWidth="1.25" strokeLinejoin="round" />
      {/* Inner crown detail lines */}
      <path d="M 11.5 26 L 12 20"    fill="none" stroke={s} strokeWidth="0.75" opacity="0.55" />
      <path d="M 17.5 26 L 14 25"    fill="none" stroke={s} strokeWidth="0.75" opacity="0.55" />
      <path d="M 22.5 26 L 22.5 25"  fill="none" stroke={s} strokeWidth="0.75" opacity="0.55" />
      <path d="M 27.5 26 L 31 25"    fill="none" stroke={s} strokeWidth="0.75" opacity="0.55" />
      <path d="M 33.5 26 L 33 20"    fill="none" stroke={s} strokeWidth="0.75" opacity="0.55" />
      {/* Waist */}
      <path d="M 7.5 28 C 7.5 26 10.5 25 22.5 25 C 34.5 25 37.5 26 37.5 28"
        fill={f} stroke={s} strokeWidth="1.5" />
      {/* Lower body */}
      <path d="M 7.5 28 L 10.5 33 L 34.5 33 L 37.5 28 Z"
        fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Base */}
      <path d="M 10 38 C 10 36 13 34.5 22.5 34.5 C 32 34.5 35 36 35 38"
        fill={f} stroke={s} strokeWidth="1.5" />
      <line x1="10" y1="38" x2="35" y2="38" stroke={s} strokeWidth="1.5" />
      <path d="M 9 41 C 9 39.5 11.5 38.5 22.5 38.5 C 33.5 38.5 36 39.5 36 41"
        fill={f} stroke={s} strokeWidth="1.5" />
      <line x1="9" y1="41" x2="36" y2="41" stroke={s} strokeWidth="1.5" />
    </g>
  );
}
