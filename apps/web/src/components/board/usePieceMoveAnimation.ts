'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Move, PieceChar } from '@raichu/shared-types';

export const SQUARE_SIZE = 64;
export const COORD_SIZE = 20;

// Keep the overlay around just long enough for the spring in Board to settle.
const CLEAR_MS = 440;

export interface AnimState {
  moveId: number;
  movingPiece:  PieceChar;
  landingPiece: PieceChar; // post-promotion char if promoted
  fromX: number; fromY: number;
  toX:   number; toY:   number;
  toRow: number; toCol: number;
  capturedPiece?: PieceChar;
  capturedX?: number; capturedY?: number;
}

function sqX(displayCol: number) { return COORD_SIZE + displayCol * SQUARE_SIZE + 2; }
function sqY(displayRow: number) { return COORD_SIZE + displayRow * SQUARE_SIZE + 2; }

/**
 * Drives the slide-to-square animation for the main board.
 *
 * - animState: present during a slide; null otherwise
 * - markDragMove: call before makeMove() when the move came from drag-and-drop
 *   so the animation is skipped (piece is already visually at dest)
 */
export function usePieceMoveAnimation(
  lastMove: Move | null,
  toDisplayRow: (r: number) => number,
  toDisplayCol: (c: number) => number,
) {
  const [animState, setAnimState] = useState<AnimState | null>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const skipRef   = useRef(false);
  const moveIdRef = useRef(0);

  // Store callbacks in refs so the effect doesn't re-fire when board is flipped
  const tdrRef = useRef(toDisplayRow);
  const tdcRef = useRef(toDisplayCol);
  tdrRef.current = toDisplayRow;
  tdcRef.current = toDisplayCol;

  const markDragMove = useCallback(() => { skipRef.current = true; }, []);

  useEffect(() => {
    if (!lastMove) return;

    if (skipRef.current) {
      skipRef.current = false;
      setAnimState(null);
      return;
    }

    clearTimeout(timerRef.current);

    const tdr = tdrRef.current;
    const tdc = tdcRef.current;

    const dFromRow = tdr(lastMove.from.row);
    const dFromCol = tdc(lastMove.from.col);
    const dToRow   = tdr(lastMove.to.row);
    const dToCol   = tdc(lastMove.to.col);

    moveIdRef.current += 1;

    const next: AnimState = {
      moveId:      moveIdRef.current,
      movingPiece:  lastMove.piece,
      landingPiece: lastMove.promotion ?? lastMove.piece,
      fromX: sqX(dFromCol), fromY: sqY(dFromRow),
      toX:   sqX(dToCol),   toY:   sqY(dToRow),
      toRow: lastMove.to.row,
      toCol: lastMove.to.col,
    };

    if (lastMove.captured) {
      const dcRow = tdr(lastMove.captured.position.row);
      const dcCol = tdc(lastMove.captured.position.col);
      next.capturedPiece = lastMove.captured.piece;
      next.capturedX     = sqX(dcCol);
      next.capturedY     = sqY(dcRow);
    }

    setAnimState(next);
    timerRef.current = setTimeout(() => setAnimState(null), CLEAR_MS);

    return () => clearTimeout(timerRef.current);
  }, [lastMove]); // only lastMove triggers; callbacks accessed via refs

  return { animState, markDragMove };
}
