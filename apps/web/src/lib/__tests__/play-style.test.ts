import { describe, it, expect } from 'vitest';
import type { Move } from '@raichu/shared-types';
import { computeGameSummary } from '../play-style';

/**
 * White advances down (+row), black advances up (-row), so advancement_bias
 * must be sign-normalised per colour. These tests pin that down along with the
 * capture attribution, which is the metric most likely to be silently wrong.
 */

function move(piece: Move['piece'], fromRow: number, toRow: number, extra: Partial<Move> = {}): Move {
  return {
    from: { row: fromRow, col: 0 },
    to: { row: toRow, col: 0 },
    piece,
    ...extra,
  };
}

const START = 1_000_000;

describe('computeGameSummary', () => {
  it('attributes captures to the right side', () => {
    const moveHistory: Move[] = [
      move('w', 1, 2, { captured: { position: { row: 2, col: 0 }, piece: 'b' } }), // white captures
      move('b', 6, 5, { captured: { position: { row: 5, col: 0 }, piece: 'w' } }), // black captures
      move('w', 2, 3),
    ];

    const summary = computeGameSummary({
      moveHistory,
      moveTimestamps: [START + 1000, START + 2000, START + 3000],
      startedAt: START,
      playerColor: 'white',
      mode: 'bot',
      status: 'white_wins',
      endedAt: START + 3000,
    });

    expect(summary.capturesFor).toBe(1);
    expect(summary.capturesAgainst).toBe(1);
    expect(summary.moveCount).toBe(3);
    expect(summary.durationMs).toBe(3000);
  });

  it('normalises advancement so positive always means toward the opponent', () => {
    // Black moving 6 → 5 is a one-row advance, even though the row index falls.
    const asBlack = computeGameSummary({
      moveHistory: [move('w', 1, 2), move('b', 6, 5)],
      moveTimestamps: [START + 500, START + 1500],
      startedAt: START,
      playerColor: 'black',
      mode: 'pvp',
      status: 'playing',
      endedAt: START + 1500,
    });

    expect(asBlack.advancementBias).toBe(1);

    const asWhite = computeGameSummary({
      moveHistory: [move('w', 1, 2), move('b', 6, 5)],
      moveTimestamps: [START + 500, START + 1500],
      startedAt: START,
      playerColor: 'white',
      mode: 'pvp',
      status: 'playing',
      endedAt: START + 1500,
    });

    expect(asWhite.advancementBias).toBe(1);
  });

  it('counts piece usage by type and only for the tracked player', () => {
    const summary = computeGameSummary({
      moveHistory: [
        move('w', 1, 2),   // white pichu
        move('B', 6, 5),   // black pikachu — must not be counted
        move('@', 2, 4),   // white raichu
        move('w', 3, 4),   // white pichu
      ],
      moveTimestamps: [START + 100, START + 200, START + 300, START + 400],
      startedAt: START,
      playerColor: 'white',
      mode: 'bot',
      status: 'white_wins',
      endedAt: START + 400,
    });

    expect(summary.pieceUsage).toEqual({ pichu: 2, pikachu: 0, raichu: 1 });
  });

  it('measures think time as the gap since the previous move', () => {
    const summary = computeGameSummary({
      moveHistory: [move('w', 1, 2), move('b', 6, 5), move('w', 2, 3)],
      // White's first move took 1s; its second took 5s (from t=2000 to t=7000).
      moveTimestamps: [START + 1000, START + 2000, START + 7000],
      startedAt: START,
      playerColor: 'white',
      mode: 'bot',
      status: 'playing',
      endedAt: START + 7000,
    });

    expect(summary.thinkMsP50).toBe(3000); // midpoint of 1000 and 5000
    expect(summary.thinkMsP90).toBe(4600);
  });

  it('returns null percentiles rather than NaN for a game with no moves', () => {
    const summary = computeGameSummary({
      moveHistory: [],
      moveTimestamps: [],
      startedAt: START,
      playerColor: 'white',
      mode: 'pvp',
      status: 'abandoned',
      endedAt: START + 10,
    });

    expect(summary.thinkMsP50).toBeNull();
    expect(summary.thinkMsP90).toBeNull();
    expect(summary.advancementBias).toBeNull();
    expect(summary.moveCount).toBe(0);
  });
});
