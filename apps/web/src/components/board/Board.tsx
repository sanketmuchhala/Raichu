'use client';

import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
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
const ANIM_MS      = 260; // ms, matches hook's ANIM_MS

// Cubic-bezier matching chess.com's piece slide feel
const SLIDE_EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function Board() {
  const boardRef = useRef<SVGSVGElement>(null);
  const theme        = useUIStore((s) => THEMES[s.theme]);
  const boardFlipped = useUIStore((s) => s.boardFlipped);
  const isDragging   = useUIStore((s) => s.isDragging);
  const dragPiece    = useUIStore((s) => s.dragPiece);
  const startDrag    = useUIStore((s) => s.startDrag);
  const updateDrag   = useUIStore((s) => s.updateDrag);
  const endDrag      = useUIStore((s) => s.endDrag);

  const board         = useGameStore((s) => s.board);
  const selectedPiece = useGameStore((s) => s.selectedPiece);
  const legalMoves    = useGameStore((s) => s.legalMoves);
  const lastMove      = useGameStore((s) => s.lastMove);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const status        = useGameStore((s) => s.status);
  const isThinking    = useGameStore((s) => s.isThinking);
  const selectPiece   = useGameStore((s) => s.selectPiece);
  const makeMove      = useGameStore((s) => s.makeMove);
  const clearSelection = useGameStore((s) => s.clearSelection);

  const toDisplayRow = useCallback((row: number) => boardFlipped ? BOARD_SIZE - 1 - row : row, [boardFlipped]);
  const toDisplayCol = useCallback((col: number) => boardFlipped ? BOARD_SIZE - 1 - col : col, [boardFlipped]);

  const { animState, markDragMove } = usePieceMoveAnimation(lastMove, toDisplayRow, toDisplayCol);

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (status !== 'playing' || isThinking) return;

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
  }, [board, selectedPiece, legalMoves, currentPlayer, status, isThinking, selectPiece, makeMove, clearSelection]);

  const handlePointerDown = useCallback((e: React.PointerEvent, row: number, col: number) => {
    const cell = board[row][col];
    if (cell === '.' || status !== 'playing' || isThinking) return;

    const isWhite = cell === 'w' || cell === 'W' || cell === '@';
    const isCurrentPlayerPiece = currentPlayer === 'white' ? isWhite : !isWhite;
    if (!isCurrentPlayerPiece) return;

    selectPiece(row, col);

    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const scale = rect.width / TOTAL_WIDTH;
      const x = (e.clientX - rect.left) / scale - COORD_SIZE;
      const y = (e.clientY - rect.top)  / scale - COORD_SIZE;
      startDrag(cell, row, col, x, y);
    }
  }, [board, currentPlayer, status, isThinking, selectPiece, startDrag]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
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

    if (boardFlipped) {
      dropRow = BOARD_SIZE - 1 - dropRow;
      dropCol = BOARD_SIZE - 1 - dropCol;
    }

    const move = legalMoves.find((m) => m.to.row === dropRow && m.to.col === dropCol);
    if (move) {
      markDragMove(); // skip slide animation — piece already at dest visually
      makeMove(move);
    }

    endDrag();
  }, [isDragging, dragPiece, boardFlipped, legalMoves, makeMove, endDrag, markDragMove]);

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
      className="w-full h-full max-w-[min(85vw,85vh)] max-h-[min(85vw,85vh)] select-none touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Background */}
      <rect width={TOTAL_WIDTH} height={TOTAL_HEIGHT} fill={theme.bgSecondary} rx="4" />

      {/* Column labels (a–h) */}
      {Array.from({ length: BOARD_SIZE }, (_, i) => {
        const displayCol = toDisplayCol(i);
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
            {COL_LABELS[i]}
          </text>
        );
      })}

      {/* Row labels (1–8) */}
      {Array.from({ length: BOARD_SIZE }, (_, i) => {
        const displayRow = toDisplayRow(i);
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
            {BOARD_SIZE - i}
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
                style={{ cursor: status === 'playing' ? 'pointer' : 'default' }}
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

      {/* Static pieces — hidden at dest square while animation plays */}
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
              style={{ cursor: status === 'playing' ? 'grab' : 'default' }}
            >
              <PieceSVG piece={cell as PieceChar} size={SQUARE_SIZE - 4} />
            </g>
          );
        })
      )}

      {/* Move animation overlay */}
      {animState && !isDragging && (
        <>
          {/* Captured piece fades out as attacker arrives */}
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

          {/* Moving piece slides from origin to destination */}
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
