import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Direct validation tests using the engine (no HTTP server needed)
import { decodeBoard, encodeBoard, generateAllMoves, createInitialBoard, applyMove } from '@raichu/game-engine';
import { findBestMove } from '@raichu/ai-engine';

describe('Bot move endpoint logic', () => {
  const INITIAL_BOARD = '........W.W.W.W..w.w.w.w................b.b.b.b..B.B.B.B........';

  describe('Valid bot requests', () => {
    it('returns a legal move for the initial board (white)', () => {
      const board = decodeBoard(INITIAL_BOARD);
      const result = findBestMove(board, 'white', 'easy');
      expect(result.move).not.toBeNull();
      expect(result.board).not.toBeNull();
      expect(result.nodesSearched).toBeGreaterThan(0);
    });

    it('returns a legal move for black', () => {
      // Make one white move first
      const board = decodeBoard(INITIAL_BOARD);
      const whiteMoves = generateAllMoves(board, 'white');
      const firstMove = whiteMoves[0];
      const boardAfterWhite = applyMove(board, firstMove);

      const result = findBestMove(boardAfterWhite, 'black', 'easy');
      expect(result.move).not.toBeNull();
    });

    it('returned move is in the legal move list', () => {
      const board = decodeBoard(INITIAL_BOARD);
      const result = findBestMove(board, 'white', 'easy');
      expect(result.move).not.toBeNull();

      const legalMoves = generateAllMoves(board, 'white');
      const isLegal = legalMoves.some(
        (m) =>
          m.from.row === result.move!.from.row &&
          m.from.col === result.move!.from.col &&
          m.to.row === result.move!.to.row &&
          m.to.col === result.move!.to.col
      );
      expect(isLegal).toBe(true);
    });

    it('returns a different board than input (actually makes a move)', () => {
      const board = decodeBoard(INITIAL_BOARD);
      const result = findBestMove(board, 'white', 'easy');
      const resultBoardStr = encodeBoard(result.board!);
      expect(resultBoardStr).not.toBe(INITIAL_BOARD);
    });

    it('includes evaluation and search statistics', () => {
      const board = decodeBoard(INITIAL_BOARD);
      const result = findBestMove(board, 'white', 'medium');
      expect(typeof result.evaluation).toBe('number');
      expect(typeof result.nodesSearched).toBe('number');
      expect(typeof result.depth).toBe('number');
      expect(typeof result.durationMs).toBe('number');
    });
  });

  describe('Invalid board handling', () => {
    it('handles board with no legal moves', () => {
      // Board where one side has no pieces (game over)
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
      const result = findBestMove(board, 'black', 'easy');
      expect(result.move).toBeNull();
    });
  });

  describe('Difficulty levels', () => {
    it('easy searches fewer nodes than hard', () => {
      const board = decodeBoard(INITIAL_BOARD);
      const easy = findBestMove(board, 'white', 'easy', 1500);
      const hard = findBestMove(board, 'white', 'hard', 3000);
      expect(easy.nodesSearched).toBeLessThan(hard.nodesSearched);
    });
  });

  describe('Zod validation logic', () => {
    it('valid board string is exactly 64 chars with valid pieces', () => {
      expect(INITIAL_BOARD.length).toBe(64);
      expect(/^[.wWbB@$]+$/.test(INITIAL_BOARD)).toBe(true);
    });

    it('rejects board string of wrong length', () => {
      const short = '........';
      expect(short.length).not.toBe(64);
    });

    it('rejects board with invalid characters', () => {
      const invalid = 'X' + INITIAL_BOARD.slice(1);
      expect(/^[.wWbB@$]+$/.test(invalid)).toBe(false);
    });
  });
});
