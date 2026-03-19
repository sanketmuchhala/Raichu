import { describe, it, expect } from 'vitest';
import { decodeBoard } from '../src/board';
import { generateRaichuMoves } from '../src/moves/raichu';

describe('Raichu moves', () => {
  describe('Quiet slides', () => {
    it('slides in all 8 directions from center', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '........' +
        '...@....' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generateRaichuMoves(board, 3, 3, '@');
      // Should have many moves in all directions
      expect(moves.length).toBeGreaterThan(20);

      // Check all 8 directions have moves
      const directions = new Set(
        moves.map((m) => {
          const dr = Math.sign(m.to.row - 3);
          const dc = Math.sign(m.to.col - 3);
          return `${dr},${dc}`;
        })
      );
      expect(directions.size).toBe(8);
    });

    it('slides blocked by friendly piece', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '........' +
        '...@....' +
        '........' +
        '...w....' +
        '........' +
        '........'
      );
      const moves = generateRaichuMoves(board, 3, 3, '@');
      // Should not have any move past row 5 in the south direction
      const southMoves = moves.filter((m) => m.to.col === 3 && m.to.row > 3);
      expect(southMoves.every((m) => m.to.row < 5)).toBe(true);
    });
  });

  describe('Captures', () => {
    it('jumps over one enemy and lands beyond', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '........' +
        '...@....' +
        '........' +
        '...b....' +
        '........' +
        '........'
      );
      const moves = generateRaichuMoves(board, 3, 3, '@');
      const captures = moves.filter((m) => m.captured);
      expect(captures.length).toBeGreaterThan(0);
      // Should capture the Pichu at (5,3)
      expect(captures.some((c) => c.captured!.position.row === 5 && c.captured!.position.col === 3)).toBe(true);
      // Landing squares should be beyond the captured piece
      const southCaptures = captures.filter((c) => c.captured!.position.row === 5);
      expect(southCaptures.every((c) => c.to.row > 5)).toBe(true);
    });

    it('can land at various distances beyond captured piece', () => {
      const board = decodeBoard(
        '........' +
        '...b....' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '...$....'
      );
      // Place Raichu at (0,3)
      board[0][3] = '@';
      const moves = generateRaichuMoves(board, 0, 3, '@');
      const captures = moves.filter((m) => m.captured && m.captured.position.row === 1);
      // Can land at row 2, 3, 4, 5, 6 (row 7 has $ blocking)
      expect(captures.length).toBe(5);
    });

    it('cannot jump over two pieces', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '........' +
        '...@....' +
        '...b....' +
        '...b....' +
        '........' +
        '........'
      );
      const moves = generateRaichuMoves(board, 3, 3, '@');
      // After jumping over first b at (4,3), should not jump second b at (5,3)
      const southCaptures = moves.filter(
        (m) => m.captured && m.to.col === 3 && m.to.row > 3
      );
      // Can only land between the two or not at all
      // First enemy at (4,3) — can land at (5,3)? No, (5,3) has 'b' which blocks.
      // So no captures in south direction at all — the first enemy is capturable
      // but the landing square (5,3) is occupied
      expect(southCaptures.length).toBe(0);
    });

    it('can capture enemy Raichu', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '........' +
        '...@....' +
        '........' +
        '...$....' +
        '........' +
        '........'
      );
      const moves = generateRaichuMoves(board, 3, 3, '@');
      const captures = moves.filter((m) => m.captured && m.captured.piece === '$');
      expect(captures.length).toBeGreaterThan(0);
    });

    it('can capture on diagonal', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '.....b..' +
        '........' +
        '........'
      );
      board[3][3] = '@';
      const moves = generateRaichuMoves(board, 3, 3, '@');
      const diagCaptures = moves.filter(
        (m) => m.captured && m.captured.position.row === 5 && m.captured.position.col === 5
      );
      expect(diagCaptures.length).toBeGreaterThan(0);
    });
  });

  describe('Edge/corner no-wrap regression', () => {
    it('Raichu at (0,0) only has 3 valid directions', () => {
      const board = decodeBoard(
        '@.......' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........' +
        '........'
      );
      const moves = generateRaichuMoves(board, 0, 0, '@');
      const directions = new Set(
        moves.map((m) => `${Math.sign(m.to.row)},${Math.sign(m.to.col)}`)
      );
      // Only S, E, SE should be possible from (0,0)
      expect(directions.size).toBe(3);
      expect(directions.has('1,0')).toBe(true);  // S
      expect(directions.has('0,1')).toBe(true);  // E
      expect(directions.has('1,1')).toBe(true);  // SE
    });

    it('Raichu ray from (4, 7) going right generates zero moves', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '........' +
        '........' +
        '.......@' +
        '........' +
        '........' +
        '........'
      );
      const moves = generateRaichuMoves(board, 4, 7, '@');
      // No moves should go to col > 7
      expect(moves.every((m) => m.to.col >= 0 && m.to.col < 8)).toBe(true);
      // Specifically no moves going east (same row, higher col)
      const eastMoves = moves.filter((m) => m.to.row === 4 && m.to.col > 7);
      expect(eastMoves.length).toBe(0);
    });
  });
});
