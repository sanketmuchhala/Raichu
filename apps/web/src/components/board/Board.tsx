'use client';

import { useCallback, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BOARD_SIZE } from '@raichu/shared-types';
import type { Move, PieceChar } from '@raichu/shared-types';
import { useGameStore } from '../../store/game-store';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { PieceSVG } from '../pieces/PieceSVG';
import { usePieceMoveAnimation, SQUARE_SIZE, COORD_SIZE } from './usePieceMoveAnimation';

const BOARD_PX    = SQUARE_SIZE * BOARD_SIZE;
const TOTAL_WIDTH  = BOARD_PX + COORD_SIZE;
const TOTAL_HEIGHT = BOARD_PX + COORD_SIZE * 2;
const COL_LABELS   = 'abcdefgh';

export function Board() {
  const boardRef = useRef<SVGSVGElement>(null);
  const dragFrameRef = useRef<number | null>(null);
  const pendingDragRef = useRef<{ x: number; y: number } | null>(null);
  const reduceMotion = useReducedMotion();
  const theme        = useUIStore((s) => THEMES[s.theme]);
  const boardFlipped = useUIStore((s) => s.boardFlipped);
  const isDragging   = useUIStore((s) => s.isDragging);
  const dragPiece    = useUIStore((s) => s.dragPiece);
  const startDrag    = useUIStore((s) => s.startDrag);
  const updateDrag   = useUIStore((s) => s.updateDrag);
  const endDrag      = useUIStore((s) => s.endDrag);
  const replayMode   = useUIStore((s) => s.replayMode);
  const replayStep   = useUIStore((s) => s.replayStep);

  const board         = useGameStore((s) => s.board);
  const boardHistory  = useGameStore((s) => s.boardHistory);
  const moveHistory   = useGameStore((s) => s.moveHistory);
  const selectedPiece = useGameStore((s) => s.selectedPiece);
  const legalMoves    = useGameStore((s) => s.legalMoves);
  const lastMove      = useGameStore((s) => s.lastMove);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const status        = useGameStore((s) => s.status);
  const isThinking    = useGameStore((s) => s.isThinking);
  const selectPiece   = useGameStore((s) => s.selectPiece);
  const makeMove      = useGameStore((s) => s.makeMove);
  const clearSelection = useGameStore((s) => s.clearSelection);

  // In replay mode, display a historical board position
  const displayBoard     = replayMode ? (boardHistory[replayStep] ?? board) : board;
  const displayLastMove  = replayMode
    ? (replayStep > 0 ? moveHistory[replayStep - 1] ?? null : null)
    : lastMove;
  const canInteract = !replayMode && status === 'playing' && !isThinking;

  const toDisplayRow = useCallback((row: number) => boardFlipped ? BOARD_SIZE - 1 - row : row, [boardFlipped]);
  const toDisplayCol = useCallback((col: number) => boardFlipped ? BOARD_SIZE - 1 - col : col, [boardFlipped]);

  const { animState, markDragMove } = usePieceMoveAnimation(lastMove, toDisplayRow, toDisplayCol);

  useEffect(() => () => {
    if (dragFrameRef.current !== null) cancelAnimationFrame(dragFrameRef.current);
  }, []);

  const queueDragUpdate = useCallback((x: number, y: number) => {
    pendingDragRef.current = { x, y };
    if (dragFrameRef.current !== null) return;

    dragFrameRef.current = requestAnimationFrame(() => {
      const pending = pendingDragRef.current;
      if (pending) updateDrag(pending.x, pending.y);
      pendingDragRef.current = null;
      dragFrameRef.current = null;
    });
  }, [updateDrag]);

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
      const isWhite = cell === 'w' || cell === 'W' || cell === '@';
      const isCurrentPlayerPiece = currentPlayer === 'white' ? isWhite : !isWhite;
      if (isCurrentPlayerPiece) {
        selectPiece(row, col);
        return;
      }
    }

    clearSelection();
  }, [board, selectedPiece, legalMoves, currentPlayer, canInteract, selectPiece, makeMove, clearSelection]);

  const handlePointerDown = useCallback((e: React.PointerEvent, row: number, col: number) => {
    const cell = board[row][col];
    if (cell === '.' || !canInteract) return;

    const isWhite = cell === 'w' || cell === 'W' || cell === '@';
    const isCurrentPlayerPiece = currentPlayer === 'white' ? isWhite : !isWhite;
    if (!isCurrentPlayerPiece) return;

    selectPiece(row, col);

    if (boardRef.current) {
      e.preventDefault();
      boardRef.current.setPointerCapture(e.pointerId);
      const rect = boardRef.current.getBoundingClientRect();
      const scale = rect.width / TOTAL_WIDTH;
      const x = (e.clientX - rect.left) / scale - COORD_SIZE;
      const y = (e.clientY - rect.top)  / scale - COORD_SIZE;
      startDrag(cell, row, col, x, y);
    }
  }, [board, currentPlayer, canInteract, selectPiece, startDrag]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const scale = rect.width / TOTAL_WIDTH;
    const x = (e.clientX - rect.left) / scale - COORD_SIZE;
    const y = (e.clientY - rect.top)  / scale - COORD_SIZE;
    queueDragUpdate(x, y);
  }, [isDragging, queueDragUpdate]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragFrameRef.current !== null) {
      cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
      pendingDragRef.current = null;
    }
    if (boardRef.current?.hasPointerCapture(e.pointerId)) {
      boardRef.current.releasePointerCapture(e.pointerId);
    }

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

    if (boardFlipped) {
      dropRow = BOARD_SIZE - 1 - dropRow;
      dropCol = BOARD_SIZE - 1 - dropCol;
    }

    const move = legalMoves.find((m) => m.to.row === dropRow && m.to.col === dropCol);
    if (move) {
      markDragMove();
      makeMove(move);
    }

    endDrag();
  }, [isDragging, dragPiece, boardFlipped, legalMoves, makeMove, endDrag, markDragMove]);

  const isLegalMoveTarget = (row: number, col: number): Move | undefined =>
    legalMoves.find((m) => m.to.row === row && m.to.col === col);

  const isLastMoveSquare = (row: number, col: number): boolean => {
    if (!displayLastMove) return false;
    return (
      (displayLastMove.from.row === row && displayLastMove.from.col === col) ||
      (displayLastMove.to.row   === row && displayLastMove.to.col   === col)
    );
  };

  return (
    <svg
      ref={boardRef}
      viewBox={`0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}`}
      className="w-full h-full select-none touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Background */}
      <rect width={TOTAL_WIDTH} height={TOTAL_HEIGHT} fill={theme.bgSecondary} rx="4" />

      {/* Column labels (a–h) — correct orientation for current perspective */}
      {Array.from({ length: BOARD_SIZE }, (_, i) => {
        const displayCol = toDisplayCol(i);
        const label = COL_LABELS[boardFlipped ? BOARD_SIZE - 1 - i : i];
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

      {/* Row labels (1–8) — 1 near white side, 8 near black side */}
      {Array.from({ length: BOARD_SIZE }, (_, i) => {
        const displayRow = toDisplayRow(i);
        const label = boardFlipped ? i + 1 : BOARD_SIZE - i;
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
          const isSelected  = !replayMode && selectedPiece?.row === row && selectedPiece?.col === col;
          const legalMove   = !replayMode ? isLegalMoveTarget(row, col) : undefined;
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

      {/* Static pieces — hidden at dest square while animation plays */}
      {Array.from({ length: BOARD_SIZE }, (_, row) =>
        Array.from({ length: BOARD_SIZE }, (_, col) => {
          const cell = displayBoard[row][col];
          if (cell === '.') return null;
          if (!replayMode && isDragging && dragPiece?.fromRow === row && dragPiece?.fromCol === col) return null;
          if (!replayMode && animState && row === animState.toRow && col === animState.toCol) return null;

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

      {/* Move animation overlay (live play only) */}
      {!replayMode && animState && !isDragging && (
        <>
          {animState.capturedPiece !== undefined &&
           animState.capturedX    !== undefined &&
           animState.capturedY    !== undefined && (
            <motion.g
              className="captured-piece-exit"
              key={`cap-${animState.moveId}`}
              initial={{ x: animState.capturedX, y: animState.capturedY, opacity: 1 }}
              animate={{ x: animState.capturedX, y: animState.capturedY, opacity: 0, scale: reduceMotion ? 1 : 0.86 }}
              transition={{ duration: reduceMotion ? 0 : 0.16, ease: 'easeOut' }}
              pointerEvents="none"
            >
              <PieceSVG piece={animState.capturedPiece} size={SQUARE_SIZE - 4} />
            </motion.g>
          )}

          <motion.g
            className="moving-piece"
            key={`mv-${animState.moveId}`}
            initial={{ x: animState.fromX, y: animState.fromY, scale: reduceMotion ? 1 : 0.94 }}
            animate={{ x: animState.toX,   y: animState.toY,   scale: 1 }}
            transition={reduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 520, damping: 38, mass: 0.72 }}
            pointerEvents="none"
          >
            <PieceSVG piece={animState.landingPiece} size={SQUARE_SIZE - 4} />
          </motion.g>
        </>
      )}

      {/* Drag overlay */}
      {!replayMode && isDragging && dragPiece && (
        <g
          className="drag-piece"
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
