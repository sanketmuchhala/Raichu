import type { CellValue } from './pieces';

/** 2D board representation — board[row][col] */
export type Board = CellValue[][];

/** Zero-based row/col position on the board */
export interface Position {
  row: number;
  col: number;
}

export const BOARD_SIZE = 8;
