'use client';

import { create } from 'zustand';
import type { Board, Move, Player, GameStatus, Difficulty, GameMode } from '@raichu/shared-types';
import {
  createInitialBoard,
  generateAllMoves,
  generateMovesForPiece,
  applyMove,
  getGameStatus,
  encodeBoard,
} from '@raichu/game-engine';

interface GameStore {
  // Game state
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  moveHistory: Move[];
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
    const { board, currentPlayer, moveHistory, gameMode, playerColor } = get();

    const newBoard = applyMove(board, move);
    const newStatus = getGameStatus(newBoard);
    const nextPlayer: Player = currentPlayer === 'white' ? 'black' : 'white';

    set({
      board: newBoard,
      currentPlayer: nextPlayer,
      status: newStatus,
      moveHistory: [...moveHistory, move],
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
    set({
      board: createInitialBoard(),
      currentPlayer: 'white',
      status: 'playing',
      moveHistory: [],
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
    const { board, currentPlayer, difficulty, status } = get();
    if (status !== 'playing') return;

    set({ isThinking: true });

    try {
      const boardStr = encodeBoard(board);
      const playerChar = currentPlayer === 'white' ? 'w' : 'b';

      const response = await fetch('/api/v1/bot/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board: boardStr,
          player: playerChar,
          difficulty,
        }),
      });

      if (!response.ok) {
        // Fallback: use local engine if API fails
        const moves = generateAllMoves(board, currentPlayer);
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          get().makeMove(randomMove);
        }
        return;
      }

      const data = await response.json();
      if (data.move) {
        get().makeMove(data.move);
      }
    } catch {
      // Fallback: use local engine for bot move
      const moves = generateAllMoves(board, currentPlayer);
      if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        get().makeMove(randomMove);
      }
    } finally {
      set({ isThinking: false });
    }
  },
}));
