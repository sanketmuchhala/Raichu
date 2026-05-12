'use client';

import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { BOARD_SIZE } from '@raichu/shared-types';
import type { Move, PieceChar } from '@raichu/shared-types';
import { useBoardContext } from './BoardContext';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { PieceSVG } from '../pieces/PieceSVG';
import { usePieceMoveAnimation, SQUARE_SIZE, COORD_SIZE } from './usePieceMoveAnimation';

const BOARD_PX    = SQUARE_SIZE * BOARD_SIZE;
const TOTAL_WIDTH  = BOARD_PX + COORD_SIZE;
const TOTAL_HEIGHT = BOARD_PX + COORD_SIZE * 2;
const COL_LABELS   = 'abcdefgh';
const ANIM_MS      = 260;

const SLIDE_EASE = [0.25, 0.46, 0.45, 0.94] as const;

interface OnlineBoardProps {
  flipped?: boolean;
  overrideBoard?: import('@raichu/shared-types').Board;
  overrideLastMove?: import('@raichu/shared-types').Move | null;
}

export function OnlineBoard({ flipped = false, overrideBoard, overrideLastMove }: OnlineBoardProps) {
  const boardRef = useRef<SVGSVGElement>(null);
  const theme      = useUIStore((s) => THEMES[s.theme]);
  const isDragging = useUIStore((s) => s.isDragging);
  const dragPiece  = useUIStore((s) => s.dragPiece);
  const startDrag  = useUIStore((s) => s.startDrag);
  const updateDrag = useUIStore((s) => s.updateDrag);
  const endDrag    = useUIStore((s) => s.endDrag);

  const {
    board: liveBoard,
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

  const toDisplayRow = useCallback((row: number) => flipped ? BOARD_SIZE - 1 - row : row, [flipped]);
  const toDisplayCol = useCallback((col: number) => flipped ? BOARD_SIZE - 1 - col : col, [flipped]);

  const { animState, markDragMove } = usePieceMoveAnimation(lastMove, toDisplayRow, toDisplayCol);

  const handleSquareClick = useCallback((row: number, col: number) => {
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
    const cell = board[row][col];
    if (cell === '.' || !canInteract) return;

    selectPiece(row, col);

    if (boardRef.current) {
      const rect  = boardRef.current.getBoundingClientRect();
      const scale = rect.width / TOTAL_WIDTH;
      const x = (e.clientX - rect.left) / scale - COORD_SIZE;
      const y = (e.clientY - rect.top)  / scale - COORD_SIZE;
      startDrag(cell, row, col, x, y);
    }
  }, [board, canInteract, selectPiece, startDrag]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !boardRef.current) return;
    const rect  = boardRef.current.getBoundingClientRect();
    const scale = rect.width / TOTAL_WIDTH;
    const x = (e.clientX - rect.left) / scale - COORD_SIZE;
    const y = (e.clientY - rect.top)  / scale - COORD_SIZE;
    updateDrag(x, y);
  }, [isDragging, updateDrag]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !boardRef.current || !dragPiece) {
      endDrag();
      return;
    }

    const rect  = boardRef.current.getBoundingClientRect();
    const scale = rect.width / TOTAL_WIDTH;
    const x = (e.clientX - rect.left) / scale - COORD_SIZE;
    const y = (e.clientY - rect.top)  / scale - COORD_SIZE;

    let dropCol = Math.floor(x / SQUARE_SIZE);
    let dropRow = Math.floor(y / SQUARE_SIZE);

    if (flipped) {
      dropRow = BOARD_SIZE - 1 - dropRow;
      dropCol = BOARD_SIZE - 1 - dropCol;
    }

    const move = legalMoves.find((m) => m.to.row === dropRow && m.to.col === dropCol);
    if (move) {
      markDragMove();
      makeMove(move);
    }

    endDrag();
  }, [isDragging, dragPiece, flipped, legalMoves, makeMove, endDrag, markDragMove]);

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
      className="w-full h-full select-none touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
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
                  x={COORD_SIZE + displayCol * SQUARE_SIZE}
                  y={COORD_SIZE + displayRow * SQUARE_SIZE}
                  width={SQUARE_SIZE} height={SQUARE_SIZE}
                  fill={theme.lastMove}
                  pointerEvents="none"
                />
              )}

              {isSelected && (
                <rect
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
        <>
          {animState.capturedPiece !== undefined &&
           animState.capturedX    !== undefined &&
           animState.capturedY    !== undefined && (
            <motion.g
              key={`cap-${animState.moveId}`}
              initial={{ x: animState.capturedX, y: animState.capturedY, opacity: 1 }}
              animate={{ x: animState.capturedX, y: animState.capturedY, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              pointerEvents="none"
            >
              <PieceSVG piece={animState.capturedPiece} size={SQUARE_SIZE - 4} />
            </motion.g>
          )}

          <motion.g
            key={`mv-${animState.moveId}`}
            initial={{ x: animState.fromX, y: animState.fromY }}
            animate={{ x: animState.toX,   y: animState.toY   }}
            transition={{ duration: ANIM_MS / 1000, ease: SLIDE_EASE }}
            pointerEvents="none"
          >
            <PieceSVG piece={animState.landingPiece} size={SQUARE_SIZE - 4} />
          </motion.g>
        </>
      )}

      {/* Drag overlay */}
      {isDragging && dragPiece && (
        <g
          transform={`translate(${dragPiece.x - SQUARE_SIZE / 2 + 2}, ${dragPiece.y - SQUARE_SIZE / 2 + 2})`}
          pointerEvents="none"
          opacity={0.85}
        >
          <PieceSVG piece={dragPiece.piece as PieceChar} size={SQUARE_SIZE - 4} />
        </g>
      )}
    </svg>
  );
}
