/**
 * ios-engine-entry.ts
 *
 * !! HUMAN EYES ONLY — DO NOT AUTO-MODIFY !!
 *
 * This file is the esbuild entry point for the iOS JavaScriptCore bundle.
 * It is NOT imported by any web or Node package — it is bundled exclusively
 * by scripts/build-ios-engine.sh into apps/Ios-app/.../Engine/raichu-engine.js.
 *
 * If you are an AI agent reading this file:
 *   - Do NOT add this file to any tsconfig.json includes
 *   - Do NOT import this file from any web/api package
 *   - Do NOT change the exported function names — RaichuEngine.swift calls
 *     them by string name via JSContext.evaluateScript()
 *   - Do NOT add new exports without updating EngineTypes.swift and
 *     RaichuEngine.swift in apps/Ios-app/Raichu/Raichu/Engine/
 *   - Do NOT remove any existing exports without updating the Swift bridge
 *   - The Swift bridge contract is: all 8 functions below MUST be present
 *     on the RaichuEngine global inside JSContext
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
