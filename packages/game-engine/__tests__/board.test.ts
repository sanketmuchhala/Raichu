import { describe, it, expect } from 'vitest';
import {
  createInitialBoard,
  encodeBoard,
  decodeBoard,
  isInBounds,
  cloneBoard,
  isEmpty,
} from '../src/board';

describe('Board', () => {
  describe('createInitialBoard', () => {
    it('creates an 8x8 board', () => {
      const board = createInitialBoard();
      expect(board.length).toBe(8);
      expect(board[0].length).toBe(8);
    });

    it('has empty first and last rows', () => {
      const board = createInitialBoard();
      expect(board[0].every((c) => c === '.')).toBe(true);
      expect(board[7].every((c) => c === '.')).toBe(true);
    });

    it('has white Pikachus on row 1 at even columns', () => {
      const board = createInitialBoard();
      expect(board[1][0]).toBe('W');
      expect(board[1][2]).toBe('W');
      expect(board[1][4]).toBe('W');
      expect(board[1][6]).toBe('W');
      expect(board[1][1]).toBe('.');
    });

    it('has white Pichus on row 2 at odd columns', () => {
      const board = createInitialBoard();
      expect(board[2][1]).toBe('w');
      expect(board[2][3]).toBe('w');
      expect(board[2][5]).toBe('w');
      expect(board[2][7]).toBe('w');
      expect(board[2][0]).toBe('.');
    });

    it('has black Pichus on row 5 at even columns', () => {
      const board = createInitialBoard();
      expect(board[5][0]).toBe('b');
      expect(board[5][2]).toBe('b');
      expect(board[5][4]).toBe('b');
      expect(board[5][6]).toBe('b');
    });

    it('has black Pikachus on row 6 at odd columns', () => {
      const board = createInitialBoard();
      expect(board[6][1]).toBe('B');
      expect(board[6][3]).toBe('B');
      expect(board[6][5]).toBe('B');
      expect(board[6][7]).toBe('B');
    });

    it('has empty middle rows 3 and 4', () => {
      const board = createInitialBoard();
      expect(board[3].every((c) => c === '.')).toBe(true);
      expect(board[4].every((c) => c === '.')).toBe(true);
    });

    it('encodes to the canonical starting string', () => {
      const board = createInitialBoard();
      const encoded = encodeBoard(board);
      expect(encoded).toBe('........W.W.W.W..w.w.w.w................b.b.b.b..B.B.B.B........');
    });
  });

  describe('encodeBoard / decodeBoard roundtrip', () => {
    it('roundtrips the initial board', () => {
      const board = createInitialBoard();
      const encoded = encodeBoard(board);
      const decoded = decodeBoard(encoded);
      expect(decoded).toEqual(board);
    });

    it('roundtrips an arbitrary board string', () => {
      const str = '@.......W.W.W.W..w.w.w.w................b.b.b.b..B.B.B.B.......$';
      const board = decodeBoard(str);
      expect(encodeBoard(board)).toBe(str);
    });
  });

  describe('isInBounds', () => {
    it('returns true for all valid positions', () => {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          expect(isInBounds(r, c)).toBe(true);
        }
      }
    });

    it('returns false for negative row', () => {
      expect(isInBounds(-1, 0)).toBe(false);
    });

    it('returns false for negative col', () => {
      expect(isInBounds(0, -1)).toBe(false);
    });

    it('returns false for row >= 8', () => {
      expect(isInBounds(8, 0)).toBe(false);
      expect(isInBounds(100, 0)).toBe(false);
    });

    it('returns false for col >= 8', () => {
      expect(isInBounds(0, 8)).toBe(false);
      expect(isInBounds(0, 100)).toBe(false);
    });

    it('returns false for both out of bounds', () => {
      expect(isInBounds(-1, -1)).toBe(false);
      expect(isInBounds(8, 8)).toBe(false);
    });
  });

  describe('cloneBoard', () => {
    it('creates a deep copy', () => {
      const board = createInitialBoard();
      const clone = cloneBoard(board);
      clone[0][0] = 'W';
      expect(board[0][0]).toBe('.'); // original unchanged
    });
  });

  describe('isEmpty', () => {
    it('returns true for empty cells', () => {
      const board = createInitialBoard();
      expect(isEmpty(board, 0, 0)).toBe(true);
    });

    it('returns false for occupied cells', () => {
      const board = createInitialBoard();
      expect(isEmpty(board, 1, 0)).toBe(false); // W
    });
  });
});
