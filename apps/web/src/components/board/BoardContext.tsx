'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Board, Move, Player, GameStatus } from '@raichu/shared-types';

/** Shared interface for both local and online board data */
export interface BoardContextValue {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  selectedPiece: { row: number; col: number } | null;
  legalMoves: Move[];
  lastMove: Move | null;
  isThinking: boolean;
  canInteract: boolean;

  selectPiece: (row: number, col: number) => void;
  makeMove: (move: Move) => void;
  clearSelection: () => void;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ value, children }: { value: BoardContextValue; children: ReactNode }) {
  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoardContext(): BoardContextValue {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoardContext must be used within a BoardProvider');
  return ctx;
}
