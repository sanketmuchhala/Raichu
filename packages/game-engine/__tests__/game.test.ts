import { describe, it, expect } from 'vitest';
import { decodeBoard, encodeBoard } from '../src/board';
import { applyMove, getGameStatus, formatMoveHuman, formatMoveCoordinate } from '../src/game';
import type { Move } from '@raichu/shared-types';

describe('Game logic', () => {
  describe('getGameStatus', () => {
    it('returns playing when both sides have pieces', () => {
      const board = decodeBoard(
        '........' +
        '........' +
        '...w....' +
        '........' +
        '........' +
        '...b....' +
        '........' +
        '........'
      );
      expect(getGameStatus(board)).toBe('playing');
    });

    it('returns white_wins when no black pieces remain', () => {
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
      expect(getGameStatus(board)).toBe('white_wins');
    });

    it('returns black_wins when no white pieces remain', () => {
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
      expect(getGameStatus(board)).toBe('black_wins');
    });
  });

  describe('applyMove', () => {
    it('moves a piece to a new position', () => {
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
      const move: Move = {
        from: { row: 2, col: 3 },
        to: { row: 3, col: 4 },
        piece: 'w',
      };
      const newBoard = applyMove(board, move);
      expect(newBoard[2][3]).toBe('.');
      expect(newBoard[3][4]).toBe('w');
    });

    it('removes captured piece', () => {
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
      const move: Move = {
        from: { row: 2, col: 3 },
        to: { row: 4, col: 5 },
        piece: 'w',
        captured: { position: { row: 3, col: 4 }, piece: 'b' },
      };
      const newBoard = applyMove(board, move);
      expect(newBoard[3][4]).toBe('.'); // captured piece removed
      expect(newBoard[4][5]).toBe('w'); // piece landed
      expect(newBoard[2][3]).toBe('.'); // origin cleared
    });

    it('applies promotion', () => {
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
      const move: Move = {
        from: { row: 6, col: 3 },
        to: { row: 7, col: 4 },
        piece: 'w',
        promotion: '@',
      };
      const newBoard = applyMove(board, move);
      expect(newBoard[7][4]).toBe('@'); // promoted to Raichu
    });

    it('does not mutate the original board', () => {
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
      const original = encodeBoard(board);
      const move: Move = {
        from: { row: 2, col: 3 },
        to: { row: 3, col: 4 },
        piece: 'w',
      };
      applyMove(board, move);
      expect(encodeBoard(board)).toBe(original);
    });
  });

  describe('Move formatting', () => {
    it('formats a quiet move in human-readable form', () => {
      const move: Move = {
        from: { row: 2, col: 3 },
        to: { row: 3, col: 4 },
        piece: 'w',
      };
      const human = formatMoveHuman(move);
      expect(human).toContain('Pichu');
      expect(human).toContain('d6');
      expect(human).toContain('e5');
    });

    it('formats a capture move in coordinate form', () => {
      const move: Move = {
        from: { row: 2, col: 3 },
        to: { row: 4, col: 5 },
        piece: 'w',
        captured: { position: { row: 3, col: 4 }, piece: 'b' },
      };
      const coord = formatMoveCoordinate(move);
      expect(coord).toContain('x'); // capture separator
    });
  });
});
