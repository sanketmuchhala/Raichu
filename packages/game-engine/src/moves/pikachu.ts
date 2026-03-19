import type { Board, Move, PieceChar } from '@raichu/shared-types';
import { isInBounds, isEmpty } from '../board';
import { canCapture, forwardDir, getOwner, promotionRow, raichuChar, isPiece } from '../pieces';

/**
 * Generate all legal moves for a Pikachu at the given position.
 *
 * Pikachu movement rules:
 * - Moves 1 or 2 squares forward, left, or right (NOT diagonal, NOT backward)
 * - All intermediate squares must be empty
 * - Captures by jumping 2 or 3 squares in same directions over exactly one enemy Pichu or Pikachu
 *   - Distance 2: P x . (enemy at dist 1, land at dist 2)
 *   - Distance 3: P . x . (empty at dist 1, enemy at dist 2, land at dist 3)
 * - Promotes to Raichu when reaching the far edge
 */
export function generatePikachuMoves(board: Board, row: number, col: number, piece: PieceChar): Move[] {
  const moves: Move[] = [];
  const player = getOwner(piece);
  const fwd = forwardDir(player);
  const promoRow = promotionRow(player);

  // 3 directions: forward, left, right
  // Each direction is (dr, dc)
  const directions: [number, number][] = [
    [fwd, 0],  // forward
    [0, -1],   // left
    [0, 1],    // right
  ];

  for (const [dr, dc] of directions) {
    // --- Quiet moves (distance 1 and 2) ---
    const r1 = row + dr;
    const c1 = col + dc;

    if (!isInBounds(r1, c1)) continue;

    if (isEmpty(board, r1, c1)) {
      // Distance 1 quiet move
      const promo1 = r1 === promoRow ? raichuChar(player) : undefined;
      moves.push({
        from: { row, col },
        to: { row: r1, col: c1 },
        piece,
        promotion: promo1,
      });

      // Distance 2 quiet move (requires dist 1 to be empty, which it is)
      const r2 = row + dr * 2;
      const c2 = col + dc * 2;
      if (isInBounds(r2, c2) && isEmpty(board, r2, c2)) {
        const promo2 = r2 === promoRow ? raichuChar(player) : undefined;
        moves.push({
          from: { row, col },
          to: { row: r2, col: c2 },
          piece,
          promotion: promo2,
        });
      }

      // --- Capture at distance 3: P . x . ---
      // Dist 1 is empty (already confirmed above), check if dist 2 has capturable enemy
      if (isInBounds(r2, c2) && !isEmpty(board, r2, c2)) {
        const midPiece = board[r2][c2];
        if (isPiece(midPiece) && canCapture(piece, midPiece)) {
          const r3 = row + dr * 3;
          const c3 = col + dc * 3;
          if (isInBounds(r3, c3) && isEmpty(board, r3, c3)) {
            const promo3 = r3 === promoRow ? raichuChar(player) : undefined;
            moves.push({
              from: { row, col },
              to: { row: r3, col: c3 },
              piece,
              captured: { position: { row: r2, col: c2 }, piece: midPiece },
              promotion: promo3,
            });
          }
        }
      }
    } else {
      // --- Capture at distance 2: P x . ---
      // Dist 1 is occupied — check if it's a capturable enemy
      const midPiece = board[r1][c1];
      if (isPiece(midPiece) && canCapture(piece, midPiece)) {
        const r2 = row + dr * 2;
        const c2 = col + dc * 2;
        if (isInBounds(r2, c2) && isEmpty(board, r2, c2)) {
          const promo2 = r2 === promoRow ? raichuChar(player) : undefined;
          moves.push({
            from: { row, col },
            to: { row: r2, col: c2 },
            piece,
            captured: { position: { row: r1, col: c1 }, piece: midPiece },
            promotion: promo2,
          });
        }
      }
    }
  }

  return moves;
}
