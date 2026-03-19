import type { Board, Move, PieceChar, Player } from '@raichu/shared-types';
import { isInBounds, isEmpty } from '../board';
import { canCapture, forwardDir, getOwner, promotionRow, raichuChar } from '../pieces';

/**
 * Generate all legal moves for a Pichu at the given position.
 *
 * Pichu movement rules:
 * - Moves 1 square diagonally forward into an empty square
 * - Captures by jumping 2 squares diagonally forward over exactly one enemy Pichu
 * - Can ONLY capture enemy Pichu (hierarchy enforced by canCapture)
 * - Promotes to Raichu when reaching the far edge
 */
export function generatePichuMoves(board: Board, row: number, col: number, piece: PieceChar): Move[] {
  const moves: Move[] = [];
  const player = getOwner(piece);
  const fwd = forwardDir(player);
  const promoRow = promotionRow(player);

  // Two diagonal directions: left (-1) and right (+1)
  for (const dc of [-1, 1]) {
    const quietRow = row + fwd;
    const quietCol = col + dc;

    // Boundary check — MUST come before board access
    if (!isInBounds(quietRow, quietCol)) continue;

    if (isEmpty(board, quietRow, quietCol)) {
      // Quiet diagonal move
      const promotion = quietRow === promoRow ? raichuChar(player) : undefined;
      moves.push({
        from: { row, col },
        to: { row: quietRow, col: quietCol },
        piece,
        promotion,
      });
    } else {
      // Check if we can jump over this piece
      const midPiece = board[quietRow][quietCol];
      if (midPiece !== '.' && canCapture(piece, midPiece as PieceChar)) {
        const jumpRow = row + fwd * 2;
        const jumpCol = col + dc * 2;

        // Boundary check for landing square
        if (!isInBounds(jumpRow, jumpCol)) continue;

        if (isEmpty(board, jumpRow, jumpCol)) {
          const promotion = jumpRow === promoRow ? raichuChar(player) : undefined;
          moves.push({
            from: { row, col },
            to: { row: jumpRow, col: jumpCol },
            piece,
            captured: { position: { row: quietRow, col: quietCol }, piece: midPiece as PieceChar },
            promotion,
          });
        }
      }
    }
  }

  return moves;
}
