import type { Board, PieceChar, Player } from '@raichu/shared-types';
import { BOARD_SIZE } from '@raichu/shared-types';
import { isPiece, getOwner, getPieceType } from '@raichu/game-engine';

/** Material values for each piece type */
const MATERIAL_VALUE: Record<string, number> = {
  pichu: 100,
  pikachu: 300,
  raichu: 900,
};

/**
 * Evaluate a board position from the perspective of the given player.
 * Positive = good for player, negative = bad.
 */
export function evaluate(board: Board, player: Player): number {
  let score = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = board[r][c];
      if (!isPiece(cell)) continue;

      const piece = cell as PieceChar;
      const owner = getOwner(piece);
      const type = getPieceType(piece);
      const material = MATERIAL_VALUE[type];

      // Advancement bonus — pieces further forward are worth slightly more
      const advancementBonus = getAdvancementBonus(r, owner, type);

      // Center control bonus — central positions are slightly better
      const centerBonus = getCenterBonus(r, c);

      const pieceValue = material + advancementBonus + centerBonus;

      if (owner === player) {
        score += pieceValue;
      } else {
        score -= pieceValue;
      }
    }
  }

  return score;
}

/** Bonus for how far forward a piece has advanced (accelerates near promotion) */
function getAdvancementBonus(row: number, owner: Player, type: string): number {
  if (type === 'raichu') return 0; // Raichus don't need advancement bonus

  const advancement = owner === 'white' ? row : (BOARD_SIZE - 1 - row);
  // Linear base + quadratic near-promotion surge
  return advancement * 8 + (advancement >= 5 ? (advancement - 4) * 15 : 0);
}

/** Bonus for being near the center of the board */
function getCenterBonus(row: number, col: number): number {
  const centerDist = Math.abs(row - 3.5) + Math.abs(col - 3.5);
  return Math.max(0, (4 - centerDist) * 5);
}

/** Check if the position is terminal (one side has no pieces) */
export function isTerminal(board: Board): { terminal: boolean; winner?: Player } {
  let hasWhite = false;
  let hasBlack = false;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = board[r][c];
      if (!isPiece(cell)) continue;
      const owner = getOwner(cell as PieceChar);
      if (owner === 'white') hasWhite = true;
      else hasBlack = true;

      if (hasWhite && hasBlack) return { terminal: false };
    }
  }

  if (!hasWhite) return { terminal: true, winner: 'black' };
  if (!hasBlack) return { terminal: true, winner: 'white' };
  return { terminal: false };
}

/** Large constant for winning/losing evaluation */
export const WIN_SCORE = 100000;
