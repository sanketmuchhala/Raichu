import type { Board, CellValue, Position } from '@raichu/shared-types';
import { BOARD_SIZE } from '@raichu/shared-types';

/**
 * Check if a position is within the board boundaries.
 * This is the NON-NEGOTIABLE boundary check — every move generator must call this.
 */
export function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/** Create the standard 8x8 starting board layout */
export function createInitialBoard(): Board {
  // Row 0: empty
  // Row 1: white Pikachus at even columns (0,2,4,6)
  // Row 2: white Pichus at odd columns (1,3,5,7)
  // Rows 3-4: empty
  // Row 5: black Pichus at even columns (0,2,4,6)
  // Row 6: black Pikachus at odd columns (1,3,5,7)
  // Row 7: empty
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array<CellValue>(BOARD_SIZE).fill('.')
  );

  for (let c = 0; c < BOARD_SIZE; c++) {
    if (c % 2 === 0) {
      board[1][c] = 'W'; // white Pikachus on row 1, even cols
      board[5][c] = 'b'; // black Pichus on row 5, even cols
    } else {
      board[2][c] = 'w'; // white Pichus on row 2, odd cols
      board[6][c] = 'B'; // black Pikachus on row 6, odd cols
    }
  }

  return board;
}

/** Encode a 2D board to a row-major string */
export function encodeBoard(board: Board): string {
  return board.map((row: CellValue[]) => row.join('')).join('');
}

/** Decode a row-major string to a 2D board */
export function decodeBoard(str: string, n: number = BOARD_SIZE): Board {
  const board: Board = [];
  for (let i = 0; i < n; i++) {
    board.push(str.slice(i * n, (i + 1) * n).split('') as CellValue[]);
  }
  return board;
}

/** Deep clone a board */
export function cloneBoard(board: Board): Board {
  return board.map((row: CellValue[]) => [...row]);
}

/** Get the cell value at a position */
export function getCell(board: Board, pos: Position): CellValue {
  return board[pos.row][pos.col];
}

/** Check if a cell is empty */
export function isEmpty(board: Board, row: number, col: number): boolean {
  return board[row][col] === '.';
}
