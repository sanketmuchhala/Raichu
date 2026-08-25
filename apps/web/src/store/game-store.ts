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
import { analytics } from '../lib/analytics';
import { computeGameSummary } from '../lib/play-style';
import { findBestMoveOffThread } from '../lib/ai-worker-client';

let botSearchId = 0;

interface GameStore {
  // Game state
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  moveHistory: Move[];
  boardHistory: Board[];
  lastMove: Move | null;

  // Play-style tracking (offline games never reach the `moves` table, so the
  // timing data has to be captured here or it is lost)
  gameStartedAt: number;
  moveTimestamps: number[];

  // Draw detection
  positionCounts: Record<string, number>;  // "boardEncoded:player" → occurrences
  halfMovesSinceProgress: number;          // resets on capture or promotion
  drawReason: string | null;

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
  gameStartedAt: Date.now(),
  moveTimestamps: [],
  positionCounts: { [`${encodeBoard(createInitialBoard())}:white`]: 1 },
  halfMovesSinceProgress: 0,
  drawReason: null,
  // Default to a bot game: the home page's primary CTA says "Play vs AI" and
  // links here, so pvp meant a first-time visitor silently played themselves.
  // Easy (400ms search) rather than medium (800ms) because every bot reply
  // blocks the main thread, and a slow first move reads as the page being broken.
  // playerColor must stay 'white' — the initial state has no equivalent of
  // newGame's bot-first kick-off, so a black default would never move.
  gameMode: 'bot',
  difficulty: 'easy',
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
    const {
      board, currentPlayer, moveHistory, boardHistory, gameMode, playerColor,
      positionCounts, halfMovesSinceProgress, gameStartedAt, moveTimestamps,
    } = get();

    const movedAt = Date.now();
    const newMoveTimestamps = [...moveTimestamps, movedAt];

    const newBoard    = applyMove(board, move);
    const nextPlayer: Player = currentPlayer === 'white' ? 'black' : 'white';

    // Base status from engine (piece count + no-legal-moves)
    let finalStatus: GameStatus = getGameStatus(newBoard, nextPlayer);

    // ── Draw detection ────────────────────────────────────────────────────

    // 1) Track half-moves without capture or promotion (50-move rule)
    const newHalfMoves = (move.captured || move.promotion) ? 0 : halfMovesSinceProgress + 1;

    // 2) Threefold repetition — position key = board encoding + side to move
    const posKey = `${encodeBoard(newBoard)}:${nextPlayer}`;
    const newPosCount = (positionCounts[posKey] ?? 0) + 1;
    const newPositionCounts = { ...positionCounts, [posKey]: newPosCount };

    let drawReason: string | null = null;
    if (finalStatus === 'playing') {
      if (newPosCount >= 3) {
        finalStatus = 'draw';
        drawReason  = 'Threefold repetition';
      } else if (newHalfMoves >= 100) {
        // 50 full moves without capture or promotion
        finalStatus = 'draw';
        drawReason  = '50-move rule';
      }
    }

    // ─────────────────────────────────────────────────────────────────────

    set({
      board: newBoard,
      currentPlayer: nextPlayer,
      status: finalStatus,
      moveHistory: [...moveHistory, move],
      moveTimestamps: newMoveTimestamps,
      boardHistory: [...boardHistory, newBoard],
      lastMove: move,
      positionCounts: newPositionCounts,
      halfMovesSinceProgress: newHalfMoves,
      drawReason,
      selectedPiece: null,
      legalMoves: [],
    });

    if (finalStatus !== 'playing') {
      const newMoveHistory = [...moveHistory, move];

      analytics.gameEnded({
        mode:        gameMode,
        status:      finalStatus,
        moveCount:   newMoveHistory.length,
        duration_ms: movedAt - gameStartedAt,
      });

      // One summary per game rather than an event per move: same analytical
      // value at roughly 1/40th the row count.
      analytics.gameSummary(
        computeGameSummary({
          moveHistory: newMoveHistory,
          moveTimestamps: newMoveTimestamps,
          startedAt: gameStartedAt,
          endedAt: movedAt,
          playerColor,
          mode: gameMode,
          difficulty: get().difficulty,
          status: finalStatus,
        }),
      );
    }

    if (gameMode === 'bot' && finalStatus === 'playing' && nextPlayer !== playerColor) {
      setTimeout(() => get().requestBotMove(), 300);
    }
  },

  clearSelection: () => {
    set({ selectedPiece: null, legalMoves: [] });
  },

  newGame: (config) => {
    botSearchId += 1;
    const initial = createInitialBoard();
    analytics.gameStarted({
      mode:        config.mode,
      difficulty:  config.difficulty,
      playerColor: config.playerColor,
    });
    set({
      board: initial,
      currentPlayer: 'white',
      status: 'playing',
      moveHistory: [],
      gameStartedAt: Date.now(),
      moveTimestamps: [],
      boardHistory: [initial],
      lastMove: null,
      positionCounts: { [`${encodeBoard(initial)}:white`]: 1 },
      halfMovesSinceProgress: 0,
      drawReason: null,
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
    const initial = get();
    if (
      initial.status !== 'playing' ||
      initial.gameMode !== 'bot' ||
      initial.currentPlayer === initial.playerColor ||
      initial.isThinking
    ) return;

    const requestId = ++botSearchId;

    set({ isThinking: true });

    // Yield to React so the "Thinking…" state renders before the synchronous
    // AI search blocks the main thread.
    await new Promise<void>(resolve => setTimeout(resolve, 50));

    try {
      const { board, currentPlayer, difficulty, status: currentStatus } = get();
      if (currentStatus !== 'playing') return;

      const position = encodeBoard(board);
      const result = await findBestMoveOffThread(board, currentPlayer, difficulty);

      const latest = get();
      if (
        requestId !== botSearchId ||
        latest.status !== 'playing' ||
        latest.currentPlayer !== currentPlayer ||
        encodeBoard(latest.board) !== position
      ) return;

      if (result.move) {
        get().makeMove(result.move);
      }
    } catch {
      // Last-resort: pick any legal move so the game never deadlocks
      const { board, currentPlayer } = get();
      if (requestId === botSearchId) {
        const moves = generateAllMoves(board, currentPlayer);
        if (moves.length > 0) {
          get().makeMove(moves[0]);
        }
      }
    } finally {
      if (requestId === botSearchId) set({ isThinking: false });
    }
  },
}));
