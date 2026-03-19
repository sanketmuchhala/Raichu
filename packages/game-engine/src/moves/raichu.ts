import type { Board, Move, PieceChar } from '@raichu/shared-types';
import { isInBounds } from '../board';
import { canCapture, getOwner, isPiece, isOwnPiece } from '../pieces';

/**
 * Generate all legal moves for a Raichu at the given position.
 *
 * Raichu movement rules (queen-like with jump capture):
 * - Moves any number of squares along any of 8 directions (horizontal, vertical, diagonal)
 * - All intermediate squares must be empty for quiet moves
 * - Captures by jumping over exactly ONE enemy piece of ANY type,
 *   then landing any number of empty squares beyond it on the same ray
 *
 * Ray-tracing algorithm:
 * 1. Step outward in a direction
 * 2. Empty squares before first occupied → quiet moves
 * 3. First occupied is enemy → continue, empties beyond → capture landings
 * 4. First occupied is friendly → stop
 * 5. Second occupied of any kind → stop
 */
export function generateRaichuMoves(board: Board, row: number, col: number, piece: PieceChar): Move[] {
  const moves: Move[] = [];
  const player = getOwner(piece);

  // 8 directions: N, S, E, W, NE, NW, SE, SW
  const directions: [number, number][] = [
    [-1, 0],  // N (up)
    [1, 0],   // S (down)
    [0, 1],   // E (right)
    [0, -1],  // W (left)
    [-1, 1],  // NE
    [-1, -1], // NW
    [1, 1],   // SE
    [1, -1],  // SW
  ];

  for (const [dr, dc] of directions) {
    let capturedPiece: PieceChar | null = null;
    let capturedPos: { row: number; col: number } | null = null;

    let r = row + dr;
    let c = col + dc;

    while (isInBounds(r, c)) {
      const cell = board[r][c];

      if (cell === '.') {
        if (capturedPiece === null) {
          // No enemy encountered yet — this is a quiet move
          moves.push({
            from: { row, col },
            to: { row: r, col: c },
            piece,
          });
        } else {
          // We've jumped over an enemy — this is a capture landing
          moves.push({
            from: { row, col },
            to: { row: r, col: c },
            piece,
            captured: { position: capturedPos!, piece: capturedPiece },
          });
        }
      } else if (isPiece(cell)) {
        if (isOwnPiece(cell, player)) {
          // Blocked by friendly piece — stop this ray
          break;
        }

        // It's an enemy piece
        if (capturedPiece !== null) {
          // Already jumped over one enemy — can't jump two, stop
          break;
        }

        // Check capture hierarchy
        if (canCapture(piece, cell as PieceChar)) {
          capturedPiece = cell as PieceChar;
          capturedPos = { row: r, col: c };
          // Continue stepping to find landing squares
        } else {
          // Can't capture this enemy type — stop
          break;
        }
      }

      r += dr;
      c += dc;
    }
  }

  return moves;
}
