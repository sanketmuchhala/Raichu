import { describe, it, expect } from 'vitest';
import { decodeBoard } from '../src/board';
import { generatePikachuMoves } from '../src/moves/pikachu';

describe('Pikachu moves', () => {
  describe('Quiet moves', () => {
    it('moves 1 and 2 squares forward', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '...W....' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 2, 3, 'W');
      const destinations = moves.map((m) => `${m.to.row},${m.to.col}`);
      expect(destinations).toContain('3,3'); // forward 1
      expect(destinations).toContain('4,3'); // forward 2
    });

    it('moves 1 and 2 squares left', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '...W....' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 2, 3, 'W');
      const destinations = moves.map((m) => `${m.to.row},${m.to.col}`);
      expect(destinations).toContain('2,2'); // left 1
      expect(destinations).toContain('2,1'); // left 2
    });

    it('moves 1 and 2 squares right', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '...W....' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 2, 3, 'W');
      const destinations = moves.map((m) => `${m.to.row},${m.to.col}`);
      expect(destinations).toContain('2,4'); // right 1
      expect(destinations).toContain('2,5'); // right 2
    });

    it('cannot move diagonally', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '...W....' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 2, 3, 'W');
      // No move should be diagonal
      const diagonals = moves.filter(
        (m) => m.to.row !== 2 && m.to.col !== 3
      );
      expect(diagonals.length).toBe(0);
    });

    it('white Pikachu cannot move backward (up)', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '........' +
        '...W....' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 3, 3, 'W');
      // No move should go to row < 3 (except sideways which stays at row 3)
      const backward = moves.filter((m) => m.to.row < 3);
      expect(backward.length).toBe(0);
    });

    it('black Pikachu cannot move backward (down)', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '........' +
        '...B....' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 3, 3, 'B');
      const backward = moves.filter((m) => m.to.row > 3);
      expect(backward.length).toBe(0);
    });

    it('cannot move 2 forward if 1 forward is blocked', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '...W....' +
        '...b....' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 2, 3, 'W');
      const forwardMoves = moves.filter((m) => m.to.col === 3 && !m.captured);
      expect(forwardMoves.length).toBe(0); // dist 1 blocked, so dist 2 quiet also blocked
    });
  });

  describe('Captures', () => {
    it('captures at distance 2 (P x .)', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '...W....' +
        '...b....' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 2, 3, 'W');
      const captures = moves.filter((m) => m.captured && m.to.row === 4);
      expect(captures.length).toBe(1);
      expect(captures[0].captured!.piece).toBe('b');
    });

    it('captures at distance 3 (P . x .)', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '...W....' +
        '........' +
        '...b....' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 2, 3, 'W');
      const captures = moves.filter((m) => m.captured && m.to.row === 5);
      expect(captures.length).toBe(1);
      expect(captures[0].captured!.piece).toBe('b');
      expect(captures[0].captured!.position.row).toBe(4);
    });

    it('can capture enemy Pikachu', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '...W....' +
        '...B....' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 2, 3, 'W');
      const captures = moves.filter((m) => m.captured);
      expect(captures.some((c) => c.captured!.piece === 'B')).toBe(true);
    });

    it('CANNOT capture enemy Raichu (hierarchy)', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '...W....' +
        '...$....' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 2, 3, 'W');
      const captures = moves.filter((m) => m.captured);
      expect(captures.length).toBe(0);
    });

    it('captures sideways (left)', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '.b.W....' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 2, 3, 'W');
      const captures = moves.filter((m) => m.captured && m.to.col === 0);
      expect(captures.length).toBe(1);
    });
  });

  describe('Promotion', () => {
    it('white Pikachu promotes on row 7', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '...W....' +
        '........'
      );
      const moves = generatePikachuMoves(board, 6, 3, 'W');
      const promos = moves.filter((m) => m.promotion && m.to.row === 7);
      expect(promos.length).toBeGreaterThan(0);
      expect(promos[0].promotion).toBe('@');
    });

    it('black Pikachu promotes on row 0', () => {
      const board = decodeBoard(
        '........' +
        '...B....' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 1, 3, 'B');
      const promos = moves.filter((m) => m.promotion && m.to.row === 0);
      expect(promos.length).toBeGreaterThan(0);
      expect(promos[0].promotion).toBe('$');
    });
  });

  describe('Edge/corner no-wrap regression', () => {
    it('Pikachu at col 0 has no left moves', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        'W.......' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 2, 0, 'W');
      const leftMoves = moves.filter((m) => m.to.col < 0);
      expect(leftMoves.length).toBe(0);
    });

    it('Pikachu at col 7 has no right moves', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '.......W' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 2, 7, 'W');
      const rightMoves = moves.filter((m) => m.to.col > 7);
      expect(rightMoves.length).toBe(0);
    });

    it('Pikachu at (3, 7) moving right does NOT wrap', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '........' +
        '.......W' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePikachuMoves(board, 3, 7, 'W');
      expect(moves.every((m) => m.to.col >= 0 && m.to.col < 8)).toBe(true);
      expect(moves.every((m) => m.to.row >= 0 && m.to.row < 8)).toBe(true);
    });
  });
});
