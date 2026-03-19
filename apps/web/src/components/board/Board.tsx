'use client';

import { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BOARD_SIZE } from '@raichu/shared-types';
import type { Move, PieceChar } from '@raichu/shared-types';
import { useGameStore } from '../../store/game-store';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { PieceSVG } from '../pieces/PieceSVG';

const SQUARE_SIZE = 64;
const COORD_SIZE = 20;
const BOARD_PX = SQUARE_SIZE * BOARD_SIZE;
const TOTAL_WIDTH = BOARD_PX + COORD_SIZE;
const TOTAL_HEIGHT = BOARD_PX + COORD_SIZE * 2; // top gutter for row numbers + bottom gutter for column letters

const COL_LABELS = 'abcdefgh';

export function Board() {
  const boardRef = useRef<SVGSVGElement>(null);
  const theme = useUIStore((s) => THEMES[s.theme]);
  const boardFlipped = useUIStore((s) => s.boardFlipped);
  const isDragging = useUIStore((s) => s.isDragging);
  const dragPiece = useUIStore((s) => s.dragPiece);
  const startDrag = useUIStore((s) => s.startDrag);
  const updateDrag = useUIStore((s) => s.updateDrag);
  const endDrag = useUIStore((s) => s.endDrag);

  const board = useGameStore((s) => s.board);
  const selectedPiece = useGameStore((s) => s.selectedPiece);
  const legalMoves = useGameStore((s) => s.legalMoves);
  const lastMove = useGameStore((s) => s.lastMove);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const status = useGameStore((s) => s.status);
  const isThinking = useGameStore((s) => s.isThinking);
  const selectPiece = useGameStore((s) => s.selectPiece);
  const makeMove = useGameStore((s) => s.makeMove);
  const clearSelection = useGameStore((s) => s.clearSelection);

  const toDisplayRow = useCallback((row: number) => boardFlipped ? BOARD_SIZE - 1 - row : row, [boardFlipped]);
  const toDisplayCol = useCallback((col: number) => boardFlipped ? BOARD_SIZE - 1 - col : col, [boardFlipped]);

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (status !== 'playing' || isThinking) return;

    // If we have a piece selected, check if clicking a legal destination
    if (selectedPiece) {
      const move = legalMoves.find((m) => m.to.row === row && m.to.col === col);
      if (move) {
        makeMove(move);
        return;
      }
    }

    // Try selecting a piece at this position
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
      const y = (e.clientY - rect.top) / scale - COORD_SIZE;
      startDrag(cell, row, col, x, y);
    }
  }, [board, currentPlayer, status, isThinking, selectPiece, startDrag]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const scale = rect.width / TOTAL_WIDTH;
    const x = (e.clientX - rect.left) / scale - COORD_SIZE;
    const y = (e.clientY - rect.top) / scale - COORD_SIZE;
    updateDrag(x, y);
  }, [isDragging, updateDrag]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !boardRef.current || !dragPiece) {
      endDrag();
      return;
    }

    const rect = boardRef.current.getBoundingClientRect();
    const scale = rect.width / TOTAL_WIDTH;
    const x = (e.clientX - rect.left) / scale - COORD_SIZE;
    const y = (e.clientY - rect.top) / scale - COORD_SIZE;

    // Convert pixel position to board coordinates
    let dropCol = Math.floor(x / SQUARE_SIZE);
    let dropRow = Math.floor(y / SQUARE_SIZE);

    if (boardFlipped) {
      dropRow = BOARD_SIZE - 1 - dropRow;
      dropCol = BOARD_SIZE - 1 - dropCol;
    }

    // Check if this is a legal move
    const move = legalMoves.find((m) => m.to.row === dropRow && m.to.col === dropCol);
    if (move) {
      makeMove(move);
    }

    endDrag();
  }, [isDragging, dragPiece, boardFlipped, legalMoves, makeMove, endDrag]);

  const isLegalMoveTarget = (row: number, col: number): Move | undefined => {
    return legalMoves.find((m) => m.to.row === row && m.to.col === col);
  };

  const isLastMoveSquare = (row: number, col: number): boolean => {
    if (!lastMove) return false;
    return (
      (lastMove.from.row === row && lastMove.from.col === col) ||
      (lastMove.to.row === row && lastMove.to.col === col)
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

      {/* Coordinate labels — columns (a-h) */}
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

      {/* Coordinate labels — rows (1-8) */}
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
          const displayRow = toDisplayRow(row);
          const displayCol = toDisplayCol(col);
          const isLight = (row + col) % 2 === 0;
          const isSelected = selectedPiece?.row === row && selectedPiece?.col === col;
          const legalMove = isLegalMoveTarget(row, col);
          const isLastMove = isLastMoveSquare(row, col);

          return (
            <g key={`${row}-${col}`}>
              {/* Square */}
              <rect
                x={COORD_SIZE + displayCol * SQUARE_SIZE}
                y={COORD_SIZE + displayRow * SQUARE_SIZE}
                width={SQUARE_SIZE}
                height={SQUARE_SIZE}
                fill={isLight ? theme.boardLight : theme.boardDark}
                onClick={() => handleSquareClick(row, col)}
                onPointerDown={(e) => handlePointerDown(e, row, col)}
                style={{ cursor: status === 'playing' ? 'pointer' : 'default' }}
              />

              {/* Last move highlight */}
              {isLastMove && (
                <rect
                  x={COORD_SIZE + displayCol * SQUARE_SIZE}
                  y={COORD_SIZE + displayRow * SQUARE_SIZE}
                  width={SQUARE_SIZE}
                  height={SQUARE_SIZE}
                  fill={theme.lastMove}
                  pointerEvents="none"
                />
              )}

              {/* Selected highlight */}
              {isSelected && (
                <rect
                  x={COORD_SIZE + displayCol * SQUARE_SIZE}
                  y={COORD_SIZE + displayRow * SQUARE_SIZE}
                  width={SQUARE_SIZE}
                  height={SQUARE_SIZE}
                  fill={theme.selected}
                  pointerEvents="none"
                />
              )}

              {/* Legal move indicator — dot for empty, ring for capture */}
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

      {/* Pieces */}
      {Array.from({ length: BOARD_SIZE }, (_, row) =>
        Array.from({ length: BOARD_SIZE }, (_, col) => {
          const cell = board[row][col];
          if (cell === '.') return null;

          // Don't render the piece being dragged at its original position
          if (isDragging && dragPiece?.fromRow === row && dragPiece?.fromCol === col) return null;

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
