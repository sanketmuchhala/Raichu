/**
 * ios-engine-entry.ts
 *
 * Phase 0.2 — IIFE entry point for the iOS JavaScriptCore bundle.
 *
 * esbuild bundles this file with --global-name=RaichuEngine, so every
 * exported symbol becomes a property on the RaichuEngine global object
 * inside JSContext.
 *
 * RaichuEngine.swift calls these functions by name via evaluateScript().
 * All types here map 1:1 to the Swift types in EngineTypes.swift.
 *
 * Board encoding:
 *   board: string[][]  — 8x8 2D array, board[row][col] = 'w'|'W'|'@'|'b'|'B'|'$'|'.'
 *   player: string     — 'white' | 'black'
 *   difficulty: string — 'easy' | 'medium' | 'hard'
 */

import {
  createInitialBoard,
  encodeBoard,
  decodeBoard,
  generateMovesForPiece,
  generateAllMoves,
  applyMove,
  getGameStatus,
} from '@raichu/game-engine';

import { findBestMove } from '@raichu/ai-engine';

import type { Board, Move, Player, Difficulty } from '@raichu/shared-types';

// Re-export everything the iOS bridge needs.
// esbuild --global-name=RaichuEngine makes these available as:
//   RaichuEngine.createInitialBoard()
//   RaichuEngine.generateMovesForPiece(board, row, col)
//   etc.

export {
  createInitialBoard,
  encodeBoard,
  decodeBoard,
  generateMovesForPiece,
  generateAllMoves,
  applyMove,
  getGameStatus,
  findBestMove,
};

// Type-only re-exports for documentation — not used at runtime by iOS bridge
export type { Board, Move, Player, Difficulty };
