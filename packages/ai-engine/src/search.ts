import type { Board, Difficulty, Move, Player } from '@raichu/shared-types';
import { generateAllMoves, applyMove, getGameStatus } from '@raichu/game-engine';
import { evaluate, isTerminal, WIN_SCORE } from './evaluation';
import { DIFFICULTY_PRESETS, type DifficultyConfig } from './difficulty';

export interface SearchResult {
  move: Move | null;
  board: Board | null;
  evaluation: number;
  nodesSearched: number;
  depth: number;
  durationMs: number;
}

interface SearchState {
  nodesSearched: number;
  startTime: number;
  timeBudgetMs: number;
  timedOut: boolean;
}

/** Opponent player */
function opponent(player: Player): Player {
  return player === 'white' ? 'black' : 'white';
}

/**
 * Order moves for better alpha-beta pruning.
 * Captures first (MVV-LVA inspired), then promotions, then quiet moves.
 */
function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    const scoreA = moveOrderScore(a);
    const scoreB = moveOrderScore(b);
    return scoreB - scoreA; // Higher score first
  });
}

function moveOrderScore(move: Move): number {
  let score = 0;
  if (move.captured) {
    // MVV-LVA: value of captured piece - value of attacker
    const capturedVal = pieceOrderValue(move.captured.piece);
    const attackerVal = pieceOrderValue(move.piece);
    score += 1000 + capturedVal - attackerVal;
  }
  if (move.promotion) {
    score += 800;
  }
  return score;
}

function pieceOrderValue(piece: string): number {
  const lower = piece.toLowerCase();
  if (lower === '@' || lower === '$') return 90;
  if (lower === 'w' || lower === 'b') {
    return piece === piece.toUpperCase() ? 30 : 10;
  }
  return 10;
}

/**
 * Alpha-beta minimax search.
 */
function alphaBeta(
  board: Board,
  player: Player,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  rootPlayer: Player,
  state: SearchState,
): number {
  state.nodesSearched++;

  // Check time budget every 1000 nodes
  if (state.nodesSearched % 1000 === 0) {
    if (Date.now() - state.startTime >= state.timeBudgetMs) {
      state.timedOut = true;
      return evaluate(board, rootPlayer);
    }
  }

  // Terminal check
  const terminal = isTerminal(board);
  if (terminal.terminal) {
    return terminal.winner === rootPlayer ? WIN_SCORE - (100 - depth) : -WIN_SCORE + (100 - depth);
  }

  // Depth limit
  if (depth <= 0) {
    return evaluate(board, rootPlayer);
  }

  const moves = orderMoves(generateAllMoves(board, player));

  // No moves available — this player loses
  if (moves.length === 0) {
    return maximizing ? -WIN_SCORE : WIN_SCORE;
  }

  if (maximizing) {
    let value = -Infinity;
    for (const move of moves) {
      if (state.timedOut) break;
      const newBoard = applyMove(board, move);
      const score = alphaBeta(newBoard, opponent(player), depth - 1, alpha, beta, false, rootPlayer, state);
      value = Math.max(value, score);
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break; // Beta cutoff
    }
    return value;
  } else {
    let value = Infinity;
    for (const move of moves) {
      if (state.timedOut) break;
      const newBoard = applyMove(board, move);
      const score = alphaBeta(newBoard, opponent(player), depth - 1, alpha, beta, true, rootPlayer, state);
      value = Math.min(value, score);
      beta = Math.min(beta, value);
      if (alpha >= beta) break; // Alpha cutoff
    }
    return value;
  }
}

/**
 * Find the best move using iterative deepening with alpha-beta pruning.
 */
export function findBestMove(
  board: Board,
  player: Player,
  difficulty: Difficulty,
  timeBudgetOverride?: number,
): SearchResult {
  const config = DIFFICULTY_PRESETS[difficulty];
  const startTime = Date.now();
  const timeBudgetMs = timeBudgetOverride ?? config.timeBudgetMs;

  const state: SearchState = {
    nodesSearched: 0,
    startTime,
    timeBudgetMs,
    timedOut: false,
  };

  const moves = generateAllMoves(board, player);

  if (moves.length === 0) {
    return {
      move: null,
      board: null,
      evaluation: -WIN_SCORE,
      nodesSearched: 0,
      depth: 0,
      durationMs: Date.now() - startTime,
    };
  }

  // If only one legal move, return it immediately
  if (moves.length === 1) {
    return {
      move: moves[0],
      board: applyMove(board, moves[0]),
      evaluation: 0,
      nodesSearched: 1,
      depth: 0,
      durationMs: Date.now() - startTime,
    };
  }

  let bestMove = moves[0];
  let bestScore = -Infinity;
  let bestDepth = 0;

  // Iterative deepening
  for (let depth = 1; depth <= config.maxDepth; depth++) {
    if (state.timedOut) break;

    let depthBestMove = moves[0];
    let depthBestScore = -Infinity;

    const orderedMoves = orderMoves(moves);

    for (const move of orderedMoves) {
      if (state.timedOut) break;

      const newBoard = applyMove(board, move);
      const score = alphaBeta(
        newBoard,
        opponent(player),
        depth - 1,
        -Infinity,
        Infinity,
        false,
        player,
        state,
      );

      if (score > depthBestScore) {
        depthBestScore = score;
        depthBestMove = move;
      }
    }

    // Only update best if we completed this depth without timing out
    if (!state.timedOut) {
      bestMove = depthBestMove;
      bestScore = depthBestScore;
      bestDepth = depth;
    }

    // If we found a winning move, stop searching
    if (bestScore >= WIN_SCORE - 100) break;
  }

  return {
    move: bestMove,
    board: applyMove(board, bestMove),
    evaluation: bestScore,
    nodesSearched: state.nodesSearched,
    depth: bestDepth,
    durationMs: Date.now() - startTime,
  };
}
