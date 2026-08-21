import type { Move, Player } from '@raichu/shared-types';
import { PIECE_OWNER_MAP, PIECE_TYPE_MAP } from '@raichu/shared-types';
import type { GameSummary } from './analytics';

/**
 * Derive play-style metrics from a finished offline game.
 *
 * Online games get the same metrics in SQL from the `moves` table (migration
 * 006), but offline and bot games never touch the database, so their move data
 * has to be summarised here before it is lost.
 *
 * These describe *how someone plays* — aggressive or cautious, fast or
 * deliberate, steady or erratic. They are not a personality measure and should
 * not be presented as one.
 */

export interface ComputeSummaryInput {
  moveHistory: Move[];
  /** Wall-clock ms for each move in moveHistory, same length and order. */
  moveTimestamps: number[];
  startedAt: number;
  playerColor: Player;
  mode: string;
  difficulty?: string;
  status: string;
  endedAt?: number;
}

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return Math.round(sorted[lo]);
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo));
}

export function computeGameSummary(input: ComputeSummaryInput): GameSummary {
  const {
    moveHistory, moveTimestamps, startedAt, playerColor,
    mode, difficulty, status, endedAt = Date.now(),
  } = input;

  let capturesFor = 0;
  let capturesAgainst = 0;
  let promotions = 0;
  let forwardSum = 0;
  let forwardCount = 0;

  const pieceUsage: Record<string, number> = { pichu: 0, pikachu: 0, raichu: 0 };
  const thinkTimes: number[] = [];

  moveHistory.forEach((move, i) => {
    // White always moves first, so parity identifies the mover without needing
    // the player stored on each Move.
    const mover: Player = PIECE_OWNER_MAP[move.piece] ?? (i % 2 === 0 ? 'white' : 'black');
    const isMine = mover === playerColor;

    if (move.captured) {
      if (isMine) capturesFor++;
      else capturesAgainst++;
    }

    if (!isMine) return;

    if (move.promotion) promotions++;

    pieceUsage[PIECE_TYPE_MAP[move.piece]] = (pieceUsage[PIECE_TYPE_MAP[move.piece]] ?? 0) + 1;

    // Normalise so positive always means "toward the opponent": white advances
    // down (+row), black advances up (-row).
    const delta = move.to.row - move.from.row;
    forwardSum += playerColor === 'white' ? delta : -delta;
    forwardCount++;

    // Think time is the gap since the previous move of the game (or the start).
    const ts = moveTimestamps[i];
    const prev = i === 0 ? startedAt : moveTimestamps[i - 1];
    if (typeof ts === 'number' && typeof prev === 'number' && ts >= prev) {
      thinkTimes.push(ts - prev);
    }
  });

  const sortedThink = [...thinkTimes].sort((a, b) => a - b);

  return {
    mode,
    difficulty,
    playerColor,
    status,
    moveCount: moveHistory.length,
    durationMs: endedAt - startedAt,
    capturesFor,
    capturesAgainst,
    promotions,
    thinkMsP50: percentile(sortedThink, 0.5),
    thinkMsP90: percentile(sortedThink, 0.9),
    advancementBias: forwardCount > 0
      ? Math.round((forwardSum / forwardCount) * 1000) / 1000
      : null,
    pieceUsage,
  };
}
