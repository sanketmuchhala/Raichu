'use client';

import { create } from 'zustand';
import type { Board, Move, Player, GameStatus, Difficulty, GameMode } from '@raichu/shared-types';
import {
  createInitialBoard,
  generateAllMoves,
  generateMovesForPiece,
  applyMove,
  getGameStatus,
} from '@raichu/game-engine';
import { findBestMove } from '@raichu/ai-engine';

interface GameStore {
  // Game state
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  moveHistory: Move[];
  boardHistory: Board[];
  lastMove: Move | null;

  // Game config
  gameMode: GameMode;
  difficulty: Difficulty;
  playerColor: Player;

  // UI state
  selectedPiece: { row: number; col: number } | null;
  legalMoves: Move[];
  isThinking: boolean;

  // Actions
  selectPiece: (row: number, col: number) => void;
  makeMove: (move: Move) => void;
  clearSelection: () => void;
  newGame: (config: { mode: GameMode; difficulty: Difficulty; playerColor: Player }) => void;
  restart: () => void;
  requestBotMove: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  board: createInitialBoard(),
  currentPlayer: 'white',
  status: 'playing',
  moveHistory: [],
  boardHistory: [createInitialBoard()],
  lastMove: null,
  gameMode: 'pvp',
  difficulty: 'medium',
  playerColor: 'white',
  selectedPiece: null,
  legalMoves: [],
  isThinking: false,

  selectPiece: (row: number, col: number) => {
    const { board, currentPlayer, gameMode, playerColor, isThinking, status } = get();
    if (status !== 'playing' || isThinking) return;

    // In bot mode, only allow selecting own pieces
    if (gameMode === 'bot' && currentPlayer !== playerColor) return;

    const moves = generateMovesForPiece(board, row, col);
    // Filter to only show moves for the current player's pieces
    const playerMoves = moves.filter(() => {
      const cell = board[row][col];
      if (cell === '.') return false;
      const isWhite = cell === 'w' || cell === 'W' || cell === '@';
      return currentPlayer === 'white' ? isWhite : !isWhite;
    });

    if (playerMoves.length > 0) {
      set({ selectedPiece: { row, col }, legalMoves: playerMoves });
    } else {
      set({ selectedPiece: null, legalMoves: [] });
    }
  },

  makeMove: (move: Move) => {
    const { board, currentPlayer, moveHistory, boardHistory, gameMode, playerColor } = get();

    const newBoard = applyMove(board, move);
    const nextPlayer: Player = currentPlayer === 'white' ? 'black' : 'white';
    const newStatus = getGameStatus(newBoard, nextPlayer);

    set({
      board: newBoard,
      currentPlayer: nextPlayer,
      status: newStatus,
      moveHistory: [...moveHistory, move],
      boardHistory: [...boardHistory, newBoard],
      lastMove: move,
      selectedPiece: null,
      legalMoves: [],
    });

    // If bot mode and it's now the bot's turn, request a move
    if (gameMode === 'bot' && newStatus === 'playing' && nextPlayer !== playerColor) {
      // Small delay so the UI updates first
      setTimeout(() => get().requestBotMove(), 300);
    }
  },

  clearSelection: () => {
    set({ selectedPiece: null, legalMoves: [] });
  },

  newGame: (config) => {
    const initial = createInitialBoard();
    set({
      board: initial,
      currentPlayer: 'white',
      status: 'playing',
      moveHistory: [],
      boardHistory: [initial],
      lastMove: null,
      gameMode: config.mode,
      difficulty: config.difficulty,
      playerColor: config.playerColor,
      selectedPiece: null,
      legalMoves: [],
      isThinking: false,
    });

    // If bot goes first
    if (config.mode === 'bot' && config.playerColor !== 'white') {
      setTimeout(() => get().requestBotMove(), 500);
    }
  },

  restart: () => {
    const { gameMode, difficulty, playerColor } = get();
    get().newGame({ mode: gameMode, difficulty, playerColor });
  },

  requestBotMove: async () => {
    const { status } = get();
    if (status !== 'playing') return;

    set({ isThinking: true });

    // Yield to React so the "Thinking…" state renders before the synchronous
    // AI search blocks the main thread.
    await new Promise<void>(resolve => setTimeout(resolve, 50));

    try {
      const { board, currentPlayer, difficulty, status: currentStatus } = get();
      if (currentStatus !== 'playing') return;

      const result = findBestMove(board, currentPlayer, difficulty);

      if (result.move) {
        get().makeMove(result.move);
      }
    } catch {
      // Last-resort: pick any legal move so the game never deadlocks
      const { board, currentPlayer } = get();
      const moves = generateAllMoves(board, currentPlayer);
      if (moves.length > 0) {
        get().makeMove(moves[0]);
      }
    } finally {
      set({ isThinking: false });
    }
  },
}));
