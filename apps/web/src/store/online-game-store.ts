'use client';

import { create } from 'zustand';
import type { Board, Move, Player, GameStatus } from '@raichu/shared-types';
import type { OnlineGameDetail, GameMove } from '@raichu/shared-types';
import { decodeBoard, generateMovesForPiece, encodeBoard, createInitialBoard } from '@raichu/game-engine';
import { gamesApi } from '../lib/api';
import { analytics } from '../lib/analytics';
import { useAuthStore } from './auth-store';

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

// ─── Analytics helpers ─────────────────────────────────────────────────────
// Online games previously emitted no events at all. Each game reports start and
// end exactly once; per-move events are deliberately omitted because the `moves`
// table already records every online move (see migration 006).

const startedTracked = new Set<string>();
const endedTracked = new Set<string>();

const TERMINAL_STATUSES = ['white_wins', 'black_wins', 'abandoned'];

/**
 * Work out which side the signed-in user is playing. The store's `myColor` is
 * set by the game page after load, so it is not reliably populated at the
 * moment these events fire.
 */
function resolveMyColor(game: OnlineGameDetail): 'white' | 'black' | null {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return null;
  if (game.white_player_id === userId) return 'white';
  if (game.black_player_id === userId) return 'black';
  return null;
}

function trackGameStarted(game: OnlineGameDetail) {
  if (game.status !== 'playing' || startedTracked.has(game.id)) return;
  startedTracked.add(game.id);

  analytics.onlineGameStarted(
    {
      gameId: game.id,
      gameType: game.game_type,
      myColor: resolveMyColor(game) ?? 'spectator',
    },
    useAuthStore.getState().user?.id ?? null,
  );
}

function trackGameEnded(game: OnlineGameDetail) {
  if (!TERMINAL_STATUSES.includes(game.status) || endedTracked.has(game.id)) return;
  endedTracked.add(game.id);

  const userId = useAuthStore.getState().user?.id ?? null;
  const myColor = resolveMyColor(game);
  const won = !!userId && game.winner_id === userId;

  analytics.onlineGameEnded(
    {
      gameId: game.id,
      gameType: game.game_type,
      status: game.status,
      myColor: myColor ?? 'spectator',
      won,
      moveCount: game.move_count,
      durationMs: game.created_at
        ? Date.now() - new Date(game.created_at).getTime()
        : undefined,
      eloDelta: won ? game.winner_elo_delta : game.loser_elo_delta,
    },
    userId,
  );
}

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

      trackGameStarted(game);
      trackGameEnded(game);
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
      const reason = err instanceof Error ? err.message : 'Failed to submit move';
      // apiFetch already recorded the transport-level failure; this records the
      // game-rule rejection ("Invalid move", "Not your turn") separately.
      analytics.invalidMove(
        { mode: 'online', reason },
        useAuthStore.getState().user?.id ?? null,
      );
      set({ error: reason });
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

    analytics.onlineResigned(
      { gameId: game.id, moveCount: game.move_count },
      useAuthStore.getState().user?.id ?? null,
    );

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

    // Realtime delivers the raw `games` row, which carries no joined profiles.
    // Assigning it wholesale would blank white_player/black_player, which the
    // game page renders, so merge and keep the profiles already loaded.
    const previous = get().game;
    const merged: OnlineGameDetail = {
      ...previous,
      ...updatedGame,
      white_player: updatedGame.white_player ?? previous?.white_player ?? null,
      black_player: updatedGame.black_player ?? previous?.black_player ?? null,
    };

    set({
      game: merged,
      board,
      currentPlayer: updatedGame.current_player as Player,
      status,
      selectedPiece: null,
      legalMoves: [],
    });

    trackGameStarted(merged);
    trackGameEnded(merged);
  },

  handleNewMove: (move: GameMove) => {
    const { moves } = get();
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
    const updatedMoves = [...moves, move];

    // ── Client-side draw detection ────────────────────────────────────────
    let drawStatus: GameStatus | null = null;

    // Threefold repetition
    const posKey = `${encodeBoard(board)}:${nextPlayer}`;
    const allKeys = [
      `${encodeBoard(createInitialBoard())}:white`,
      ...updatedMoves.map((m) => `${encodeBoard(decodeBoard(m.board_after))}:${m.player === 'white' ? 'black' : 'white'}`),
    ];
    if (allKeys.filter(k => k === posKey).length >= 3) drawStatus = 'draw';

    // 50-move rule
    if (!drawStatus) {
      let halfMoves = 0;
      for (let i = updatedMoves.length - 1; i >= 0; i--) {
        if (updatedMoves[i].captured_piece || updatedMoves[i].promotion) break;
        halfMoves++;
      }
      if (halfMoves >= 100) drawStatus = 'draw';
    }
    // ─────────────────────────────────────────────────────────────────────

    set({
      moves: updatedMoves,
      board,
      lastMove,
      currentPlayer: nextPlayer,
      selectedPiece: null,
      legalMoves: [],
      ...(drawStatus ? { status: drawStatus } : {}),
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
