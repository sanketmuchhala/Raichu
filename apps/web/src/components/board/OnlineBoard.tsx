'use client';

import { useCallback, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BOARD_SIZE } from '@raichu/shared-types';
import type { Move, PieceChar } from '@raichu/shared-types';
import { useBoardContext } from './BoardContext';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { PieceSVG } from '../pieces/PieceSVG';
import { usePieceMoveAnimation, SQUARE_SIZE, COORD_SIZE } from './usePieceMoveAnimation';
import { useSmoothPieceDrag } from './useSmoothPieceDrag';
import { PieceMoveOverlay } from './PieceMoveOverlay';

const BOARD_PX    = SQUARE_SIZE * BOARD_SIZE;
const TOTAL_WIDTH  = BOARD_PX + COORD_SIZE;
const TOTAL_HEIGHT = BOARD_PX + COORD_SIZE * 2;
const COL_LABELS   = 'abcdefgh';

interface OnlineBoardProps {
  flipped?: boolean;
  overrideBoard?: import('@raichu/shared-types').Board;
  overrideLastMove?: import('@raichu/shared-types').Move | null;
}

export function OnlineBoard({ flipped = false, overrideBoard, overrideLastMove }: OnlineBoardProps) {
  const boardRef = useRef<SVGSVGElement>(null);
  const pendingDragRef = useRef<{
    piece: PieceChar;
    row: number;
    col: number;
    pointerId: number;
    clientX: number;
    clientY: number;
  } | null>(null);
  const dragActivatedRef = useRef(false);
  const settlingRef = useRef(false);
  const suppressClickRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const theme      = useUIStore((s) => THEMES[s.theme]);
  const isDragging = useUIStore((s) => s.isDragging);
  const dragPiece  = useUIStore((s) => s.dragPiece);
  const startDrag  = useUIStore((s) => s.startDrag);
  const endDrag    = useUIStore((s) => s.endDrag);

  const {
    board: liveBoard,
    currentPlayer,
    selectedPiece,
    legalMoves,
    lastMove: liveLastMove,
    status,
    canInteract: liveCanInteract,
    selectPiece,
    makeMove,
    clearSelection,
  } = useBoardContext();

  const board = overrideBoard ?? liveBoard;
  const lastMove = overrideLastMove !== undefined ? overrideLastMove : liveLastMove;
  const canInteract = overrideBoard ? false : liveCanInteract;
  const dragMotion = useSmoothPieceDrag(boardRef, TOTAL_WIDTH, reduceMotion ?? false);

  const toDisplayRow = useCallback((row: number) => flipped ? BOARD_SIZE - 1 - row : row, [flipped]);
  const toDisplayCol = useCallback((col: number) => flipped ? BOARD_SIZE - 1 - col : col, [flipped]);

  const { animState, markDragMove } = usePieceMoveAnimation(lastMove, toDisplayRow, toDisplayCol);

  useEffect(() => () => {
    pendingDragRef.current = null;
    dragActivatedRef.current = false;
    settlingRef.current = false;
    dragMotion.stopAnimations();
    endDrag();
  }, [dragMotion.stopAnimations, endDrag]);

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (suppressClickRef.current) return;
    if (!canInteract) return;

    if (selectedPiece) {
      const move = legalMoves.find((m) => m.to.row === row && m.to.col === col);
      if (move) {
        makeMove(move);
        return;
      }
    }

    const cell = board[row][col];
    if (cell !== '.') {
      selectPiece(row, col);
      return;
    }

    clearSelection();
  }, [board, selectedPiece, legalMoves, canInteract, selectPiece, makeMove, clearSelection]);

  const handlePointerDown = useCallback((e: React.PointerEvent, row: number, col: number) => {
    if (pendingDragRef.current || settlingRef.current) return;
    const cell = board[row][col];
    if (cell === '.' || !canInteract) return;

    const isWhite = cell === 'w' || cell === 'W' || cell === '@';
    const isCurrentPlayerPiece = currentPlayer === 'white' ? isWhite : !isWhite;
    if (!isCurrentPlayerPiece) return;

    selectPiece(row, col);

    const point = dragMotion.begin(e);
    if (!point) return;

    pendingDragRef.current = {
      piece: cell as PieceChar,
      row,
      col,
      pointerId: e.pointerId,
      clientX: e.clientX,
      clientY: e.clientY,
    };
    dragActivatedRef.current = false;
  }, [board, canInteract, currentPlayer, dragMotion.begin, selectPiece]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const pending = pendingDragRef.current;
    if (!pending || pending.pointerId !== e.pointerId || settlingRef.current) return;

    if (!dragActivatedRef.current) {
      const distance = Math.hypot(e.clientX - pending.clientX, e.clientY - pending.clientY);
      if (distance < 5) return;

      dragActivatedRef.current = true;
      suppressClickRef.current = true;
      startDrag(pending.piece, pending.row, pending.col);
    }

    dragMotion.update(e);
  }, [dragMotion.update, startDrag]);

  const finishPointerDrag = useCallback((e: React.PointerEvent, cancelled: boolean) => {
    const pending = pendingDragRef.current;
    if (!pending || pending.pointerId !== e.pointerId) return;

    const point = dragMotion.pointFromPointer(e);
    dragMotion.releasePointer(e);
    pendingDragRef.current = null;

    if (!dragActivatedRef.current) {
      dragMotion.stopAnimations();
      return;
    }

    if (cancelled) {
      suppressClickRef.current = false;
    } else {
      window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    }

    let move: Move | undefined;
    if (!cancelled && point) {
      let dropCol = Math.floor(point.x / SQUARE_SIZE);
      let dropRow = Math.floor(point.y / SQUARE_SIZE);

      if (flipped) {
        dropRow = BOARD_SIZE - 1 - dropRow;
        dropCol = BOARD_SIZE - 1 - dropCol;
      }

      move = legalMoves.find((candidate) =>
        candidate.to.row === dropRow && candidate.to.col === dropCol
      );
    }

    settlingRef.current = true;
    const complete = () => {
      if (move) {
        markDragMove();
        makeMove(move);
      }
      settlingRef.current = false;
      dragActivatedRef.current = false;
      endDrag();
    };

    if (move) {
      dragMotion.settleTo(
        dragMotion.squareOrigin(toDisplayRow(move.to.row), toDisplayCol(move.to.col)),
        0.085,
        complete,
      );
      return;
    }

    dragMotion.settleTo(
      dragMotion.squareOrigin(toDisplayRow(pending.row), toDisplayCol(pending.col)),
      0.16,
      complete,
    );
  }, [
    dragMotion.pointFromPointer,
    dragMotion.releasePointer,
    dragMotion.settleTo,
    dragMotion.squareOrigin,
    dragMotion.stopAnimations,
    endDrag,
    flipped,
    legalMoves,
    makeMove,
    markDragMove,
    toDisplayCol,
    toDisplayRow,
  ]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    finishPointerDrag(e, false);
  }, [finishPointerDrag]);

  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    finishPointerDrag(e, true);
  }, [finishPointerDrag]);

  const isLegalMoveTarget = (row: number, col: number): Move | undefined =>
    legalMoves.find((m) => m.to.row === row && m.to.col === col);

  const isLastMoveSquare = (row: number, col: number): boolean => {
    if (!lastMove) return false;
    return (
      (lastMove.from.row === row && lastMove.from.col === col) ||
      (lastMove.to.row   === row && lastMove.to.col   === col)
    );
  };

  return (
    <svg
      ref={boardRef}
      viewBox={`0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}`}
      className={`game-board-svg w-full h-full select-none touch-none${isDragging ? ' is-piece-dragging' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <rect width={TOTAL_WIDTH} height={TOTAL_HEIGHT} fill={theme.bgSecondary} rx="4" />

      {/* Column labels — correct orientation for current perspective */}
      {Array.from({ length: BOARD_SIZE }, (_, i) => {
        const displayCol = toDisplayCol(i);
        const label = COL_LABELS[flipped ? BOARD_SIZE - 1 - i : i];
        return (
          <text
            key={`col-${i}`}
            x={COORD_SIZE + displayCol * SQUARE_SIZE + SQUARE_SIZE / 2}
            y={COORD_SIZE + BOARD_PX + 14}
            textAnchor="middle"
            fontSize="11"
            fill={theme.textSecondary}
            fontFamily="system-ui, sans-serif"
          >
            {label}
          </text>
        );
      })}

      {/* Row labels — 1 near white side, 8 near black side */}
      {Array.from({ length: BOARD_SIZE }, (_, i) => {
        const displayRow = toDisplayRow(i);
        const label = flipped ? i + 1 : BOARD_SIZE - i;
        return (
          <text
            key={`row-${i}`}
            x={8}
            y={COORD_SIZE + displayRow * SQUARE_SIZE + SQUARE_SIZE / 2 + 4}
            textAnchor="middle"
            fontSize="11"
            fill={theme.textSecondary}
            fontFamily="system-ui, sans-serif"
          >
            {label}
          </text>
        );
      })}

      {/* Board squares */}
      {Array.from({ length: BOARD_SIZE }, (_, row) =>
        Array.from({ length: BOARD_SIZE }, (_, col) => {
          const displayRow  = toDisplayRow(row);
          const displayCol  = toDisplayCol(col);
          const isLight     = (row + col) % 2 === 0;
          const isSelected  = selectedPiece?.row === row && selectedPiece?.col === col;
          const legalMove   = isLegalMoveTarget(row, col);
          const isLastMove  = isLastMoveSquare(row, col);

          return (
            <g key={`${row}-${col}`}>
              <rect
                x={COORD_SIZE + displayCol * SQUARE_SIZE}
                y={COORD_SIZE + displayRow * SQUARE_SIZE}
                width={SQUARE_SIZE} height={SQUARE_SIZE}
                fill={isLight ? theme.boardLight : theme.boardDark}
                onClick={() => handleSquareClick(row, col)}
                onPointerDown={(e) => handlePointerDown(e, row, col)}
                style={{ cursor: canInteract ? 'pointer' : 'default' }}
              />

              {isLastMove && (
                <rect
                  className="last-move-square"
                  x={COORD_SIZE + displayCol * SQUARE_SIZE}
                  y={COORD_SIZE + displayRow * SQUARE_SIZE}
                  width={SQUARE_SIZE} height={SQUARE_SIZE}
                  fill={theme.lastMove}
                  pointerEvents="none"
                />
              )}

              {isSelected && (
                <rect
                  className="selected-square"
                  x={COORD_SIZE + displayCol * SQUARE_SIZE}
                  y={COORD_SIZE + displayRow * SQUARE_SIZE}
                  width={SQUARE_SIZE} height={SQUARE_SIZE}
                  fill={theme.selected}
                  pointerEvents="none"
                />
              )}

              {legalMove && !isSelected && (
                legalMove.captured ? (
                  <circle
                    className="capture-ring"
                    cx={COORD_SIZE + displayCol * SQUARE_SIZE + SQUARE_SIZE / 2}
                    cy={COORD_SIZE + displayRow * SQUARE_SIZE + SQUARE_SIZE / 2}
                    r={SQUARE_SIZE / 2 - 4}
                    fill="none"
                    stroke={theme.captureIndicator}
                    strokeWidth={3}
                    pointerEvents="none"
                  />
                ) : (
                  <circle
                    className="legal-move-dot"
                    cx={COORD_SIZE + displayCol * SQUARE_SIZE + SQUARE_SIZE / 2}
                    cy={COORD_SIZE + displayRow * SQUARE_SIZE + SQUARE_SIZE / 2}
                    r={SQUARE_SIZE / 6}
                    fill={theme.legalMove}
                    pointerEvents="none"
                  />
                )
              )}
            </g>
          );
        })
      )}

      {/* Static pieces — hidden at dest while animation plays */}
      {Array.from({ length: BOARD_SIZE }, (_, row) =>
        Array.from({ length: BOARD_SIZE }, (_, col) => {
          const cell = board[row][col];
          if (cell === '.') return null;
          if (isDragging && dragPiece?.fromRow === row && dragPiece?.fromCol === col) return null;
          if (animState && row === animState.toRow && col === animState.toCol) return null;

          const displayRow = toDisplayRow(row);
          const displayCol = toDisplayCol(col);
          const pieceX = COORD_SIZE + displayCol * SQUARE_SIZE + 2;
          const pieceY = COORD_SIZE + displayRow * SQUARE_SIZE + 2;

          return (
            <g
              key={`piece-${row}-${col}`}
              className={`board-piece${canInteract ? ' is-interactive' : ''}`}
              transform={`translate(${pieceX}, ${pieceY})`}
              onClick={() => handleSquareClick(row, col)}
              onPointerDown={(e) => handlePointerDown(e, row, col)}
              style={{ cursor: canInteract ? 'grab' : 'default' }}
            >
              <PieceSVG piece={cell as PieceChar} size={SQUARE_SIZE - 4} />
            </g>
          );
        })
      )}

      {/* Move animation overlay */}
      {animState && !isDragging && (
        <PieceMoveOverlay animation={animState} reduceMotion={reduceMotion ?? false} />
      )}

      {/* Drag overlay */}
      {isDragging && dragPiece && (
        <motion.g
          className="drag-piece"
          style={{ x: dragMotion.x, y: dragMotion.y, opacity: dragMotion.opacity }}
          pointerEvents="none"
        >
          <motion.g className="drag-piece-visual" style={{ scale: dragMotion.scale }}>
            <PieceSVG piece={dragPiece.piece as PieceChar} size={SQUARE_SIZE - 4} />
          </motion.g>
        </motion.g>
      )}
    </svg>
  );
}
