'use client';

import { create } from 'zustand';
import type { Board, Move, Player, GameStatus } from '@raichu/shared-types';
import type { OnlineGameDetail, GameMove } from '@raichu/shared-types';
import { decodeBoard, generateMovesForPiece } from '@raichu/game-engine';
import { gamesApi } from '../lib/api';

interface OnlineGameStore {
  // Game data
  game: OnlineGameDetail | null;
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  moves: GameMove[];
  lastMove: Move | null;

  // UI state
  selectedPiece: { row: number; col: number } | null;
  legalMoves: Move[];
  isThinking: boolean;
  myColor: 'white' | 'black' | null;
  error: string | null;
  loading: boolean;

  // Actions
  loadGame: (gameId: string) => Promise<void>;
  selectPiece: (row: number, col: number) => void;
  submitMove: (move: Move) => Promise<void>;
  clearSelection: () => void;
  resign: () => Promise<void>;

  // Realtime handlers
  handleGameUpdate: (game: OnlineGameDetail) => void;
  handleNewMove: (move: GameMove) => void;
  reset: () => void;
}

const EMPTY_BOARD: Board = Array.from({ length: 8 }, () => Array(8).fill('.'));

export const useOnlineGameStore = create<OnlineGameStore>((set, get) => ({
  game: null,
  board: EMPTY_BOARD,
  currentPlayer: 'white',
  status: 'playing',
  moves: [],
  lastMove: null,
  selectedPiece: null,
  legalMoves: [],
  isThinking: false,
  myColor: null,
  error: null,
  loading: false,

  loadGame: async (gameId: string) => {
    set({ loading: true, error: null });
    try {
      const game = (await gamesApi.get(gameId)) as OnlineGameDetail;
      const moves = (await gamesApi.getMoves(gameId)) as GameMove[];
      const board = decodeBoard(game.board_state);

      // Determine the game status mapping
      let status: GameStatus = 'playing';
      if (game.status === 'white_wins') status = 'white_wins';
      else if (game.status === 'black_wins') status = 'black_wins';
      else if (game.status === 'abandoned') status = 'white_wins'; // treat as over

      // Build last move from most recent move record
      let lastMove: Move | null = null;
      if (moves.length > 0) {
        const last = moves[moves.length - 1];
        lastMove = {
          from: { row: last.from_row, col: last.from_col },
          to: { row: last.to_row, col: last.to_col },
          piece: last.piece as Move['piece'],
          captured: last.captured_piece
            ? {
                position: { row: last.captured_row!, col: last.captured_col! },
                piece: last.captured_piece as Move['piece'],
              }
            : undefined,
          promotion: last.promotion as Move['promotion'],
        };
      }

      set({
        game,
        board,
        currentPlayer: game.current_player as Player,
        status,
        moves,
        lastMove,
        loading: false,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load game', loading: false });
    }
  },

  selectPiece: (row: number, col: number) => {
    const { board, currentPlayer, myColor, isThinking, status } = get();
    if (status !== 'playing' || isThinking || currentPlayer !== myColor) return;

    const cell = board[row][col];
    if (cell === '.') {
      set({ selectedPiece: null, legalMoves: [] });
      return;
    }

    const isWhite = cell === 'w' || cell === 'W' || cell === '@';
    const isMyPiece = myColor === 'white' ? isWhite : !isWhite;
    if (!isMyPiece) {
      set({ selectedPiece: null, legalMoves: [] });
      return;
    }

    const moves = generateMovesForPiece(board, row, col);
    // Filter for current player's pieces
    const playerMoves = moves.filter(() => {
      return myColor === 'white' ? isWhite : !isWhite;
    });

    if (playerMoves.length > 0) {
      set({ selectedPiece: { row, col }, legalMoves: playerMoves });
    } else {
      set({ selectedPiece: null, legalMoves: [] });
    }
  },

  submitMove: async (move: Move) => {
    const { game } = get();
    if (!game) return;

    set({ isThinking: true, selectedPiece: null, legalMoves: [] });

    try {
      await gamesApi.move(game.id, move);
      // The game state will be updated via Realtime subscription
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to submit move' });
    } finally {
      set({ isThinking: false });
    }
  },

  clearSelection: () => {
    set({ selectedPiece: null, legalMoves: [] });
  },

  resign: async () => {
    const { game } = get();
    if (!game) return;

    try {
      await gamesApi.resign(game.id);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to resign' });
    }
  },

  handleGameUpdate: (updatedGame: OnlineGameDetail) => {
    const board = decodeBoard(updatedGame.board_state);

    let status: GameStatus = 'playing';
    if (updatedGame.status === 'white_wins') status = 'white_wins';
    else if (updatedGame.status === 'black_wins') status = 'black_wins';
    else if (updatedGame.status === 'abandoned') status = 'white_wins';

    set({
      game: updatedGame,
      board,
      currentPlayer: updatedGame.current_player as Player,
      status,
      selectedPiece: null,
      legalMoves: [],
    });
  },

  handleNewMove: (move: GameMove) => {
    const { moves } = get();
    // Deduplicate
    if (moves.some((m) => m.id === move.id)) return;

    const board = decodeBoard(move.board_after);
    const lastMove: Move = {
      from: { row: move.from_row, col: move.from_col },
      to: { row: move.to_row, col: move.to_col },
      piece: move.piece as Move['piece'],
      captured: move.captured_piece
        ? {
            position: { row: move.captured_row!, col: move.captured_col! },
            piece: move.captured_piece as Move['piece'],
          }
        : undefined,
      promotion: move.promotion as Move['promotion'],
    };

    const nextPlayer: Player = move.player === 'white' ? 'black' : 'white';

    set({
      moves: [...moves, move],
      board,
      lastMove,
      currentPlayer: nextPlayer,
      selectedPiece: null,
      legalMoves: [],
    });
  },

  reset: () => {
    set({
      game: null,
      board: EMPTY_BOARD,
      currentPlayer: 'white',
      status: 'playing',
      moves: [],
      lastMove: null,
      selectedPiece: null,
      legalMoves: [],
      isThinking: false,
      myColor: null,
      error: null,
      loading: false,
    });
  },
}));
