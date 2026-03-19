import type { Board, Move, PieceChar, Player } from '@raichu/shared-types';
import { getPieceType, getOwner, isPiece } from '../pieces';
import { generatePichuMoves } from './pichu';
import { generatePikachuMoves } from './pikachu';
import { generateRaichuMoves } from './raichu';

/** Generate all legal moves for a specific piece at a position */
export function generateMovesForPiece(board: Board, row: number, col: number): Move[] {
  const cell = board[row][col];
  if (cell === '.') return [];

  const piece = cell as PieceChar;
  const type = getPieceType(piece);

  switch (type) {
    case 'pichu':
      return generatePichuMoves(board, row, col, piece);
    case 'pikachu':
      return generatePikachuMoves(board, row, col, piece);
    case 'raichu':
      return generateRaichuMoves(board, row, col, piece);
    default:
      return [];
  }
}

/** Generate all legal moves for a player */
export function generateAllMoves(board: Board, player: Player): Move[] {
  const moves: Move[] = [];

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = board[row][col];
      if (cell !== '.' && getOwner(cell as PieceChar) === player) {
        moves.push(...generateMovesForPiece(board, row, col));
      }
    }
  }

  return moves;
}

export { generatePichuMoves } from './pichu';
export { generatePikachuMoves } from './pikachu';
export { generateRaichuMoves } from './raichu';
