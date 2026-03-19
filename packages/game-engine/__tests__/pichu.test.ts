import { describe, it, expect } from 'vitest';
import { decodeBoard } from '../src/board';
import { generatePichuMoves } from '../src/moves/pichu';

describe('Pichu moves', () => {
  describe('White Pichu quiet moves', () => {
    it('moves diagonally forward (down-left and down-right)', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '...w....' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePichuMoves(board, 2, 3, 'w');
      const destinations = moves.map((m) => `${m.to.row},${m.to.col}`);
      expect(destinations).toContain('3,2'); // down-left
      expect(destinations).toContain('3,4'); // down-right
      expect(moves.length).toBe(2);
    });

    it('cannot move backward', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '........' +
        '...w....' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePichuMoves(board, 3, 3, 'w');
      // All moves should have to.row > 3 (moving down)
      expect(moves.every((m) => m.to.row > 3)).toBe(true);
    });
  });

  describe('Black Pichu quiet moves', () => {
    it('moves diagonally forward (up-left and up-right)', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '...b....' +
        '........' +
        '........'
      );
      const moves = generatePichuMoves(board, 5, 3, 'b');
      const destinations = moves.map((m) => `${m.to.row},${m.to.col}`);
      expect(destinations).toContain('4,2'); // up-left
      expect(destinations).toContain('4,4'); // up-right
      expect(moves.length).toBe(2);
    });
  });

  describe('Pichu captures', () => {
    it('white captures black Pichu by jumping', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '...w....' +
        '....b...' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePichuMoves(board, 2, 3, 'w');
      const captures = moves.filter((m) => m.captured);
      expect(captures.length).toBe(1);
      expect(captures[0].to.row).toBe(4);
      expect(captures[0].to.col).toBe(5);
      expect(captures[0].captured!.piece).toBe('b');
    });

    it('Pichu CANNOT capture Pikachu (hierarchy)', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '...w....' +
        '....B...' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePichuMoves(board, 2, 3, 'w');
      const captures = moves.filter((m) => m.captured);
      expect(captures.length).toBe(0);
    });

    it('Pichu CANNOT capture Raichu (hierarchy)', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '...w....' +
        '....$...' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePichuMoves(board, 2, 3, 'w');
      const captures = moves.filter((m) => m.captured);
      expect(captures.length).toBe(0);
    });

    it('cannot capture if landing square is occupied', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '...w....' +
        '....b...' +
        '.....B..' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePichuMoves(board, 2, 3, 'w');
      const captures = moves.filter((m) => m.captured);
      expect(captures.length).toBe(0);
    });
  });

  describe('Pichu promotion', () => {
    it('white Pichu promotes on row 7', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '...w....' +
        '........'
      );
      const moves = generatePichuMoves(board, 6, 3, 'w');
      const promos = moves.filter((m) => m.promotion);
      expect(promos.length).toBe(2);
      expect(promos[0].promotion).toBe('@');
    });

    it('black Pichu promotes on row 0', () => {
      const board = decodeBoard(
        '........' +
        '...b....' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePichuMoves(board, 1, 3, 'b');
      const promos = moves.filter((m) => m.promotion);
      expect(promos.length).toBe(2);
      expect(promos[0].promotion).toBe('$');
    });
  });

  describe('Edge/corner no-wrap regression', () => {
    it('Pichu at col 0 cannot move left-diagonal', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        'w.......' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePichuMoves(board, 2, 0, 'w');
      // Only right-diagonal is valid
      expect(moves.length).toBe(1);
      expect(moves[0].to.col).toBe(1);
    });

    it('Pichu at col 7 cannot move right-diagonal', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '.......w' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePichuMoves(board, 2, 7, 'w');
      // Only left-diagonal is valid
      expect(moves.length).toBe(1);
      expect(moves[0].to.col).toBe(6);
    });

    it('Pichu at (2, 7) does NOT generate a move wrapping to (3, 0)', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '.......w' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePichuMoves(board, 2, 7, 'w');
      expect(moves.every((m) => m.to.col >= 0 && m.to.col < 8)).toBe(true);
      expect(moves.every((m) => m.to.col !== 0 || m.to.row === 2)).toBe(true);
    });

    it('white Pichu at row 7 cannot move (off board)', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '...w....'
      );
      const moves = generatePichuMoves(board, 7, 3, 'w');
      expect(moves.length).toBe(0);
    });

    it('black Pichu at row 0 cannot move (off board)', () => {
      const board = decodeBoard(
        '...b....' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generatePichuMoves(board, 0, 3, 'b');
      expect(moves.length).toBe(0);
    });
  });
});
