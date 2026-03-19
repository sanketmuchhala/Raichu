import type { CellValue, PieceChar, PieceType, Player } from '@raichu/shared-types';
import { PIECE_TYPE_MAP, PIECE_OWNER_MAP, WHITE_PIECES, BLACK_PIECES } from '@raichu/shared-types';

export function isPiece(cell: CellValue): cell is PieceChar {
  return cell !== '.';
}

export function isWhitePiece(cell: CellValue): boolean {
  return (WHITE_PIECES as readonly string[]).includes(cell);
}

export function isBlackPiece(cell: CellValue): boolean {
  return (BLACK_PIECES as readonly string[]).includes(cell);
}

export function getOwner(piece: PieceChar): Player {
  return PIECE_OWNER_MAP[piece];
}

export function getPieceType(piece: PieceChar): PieceType {
  return PIECE_TYPE_MAP[piece];
}

export function isOwnPiece(cell: CellValue, player: Player): boolean {
  if (cell === '.') return false;
  return getOwner(cell as PieceChar) === player;
}

export function isEnemyPiece(cell: CellValue, player: Player): boolean {
  if (cell === '.') return false;
  return getOwner(cell as PieceChar) !== player;
}

/**
 * THE capture hierarchy gate.
 * This is the most critical correctness check in the engine.
 *
 * - Pichu captures only enemy Pichu
 * - Pikachu captures enemy Pichu or Pikachu
 * - Raichu captures any enemy piece
 */
export function canCapture(attacker: PieceChar, target: PieceChar): boolean {
  if (getOwner(attacker) === getOwner(target)) return false;

  const attackerType = getPieceType(attacker);
  const targetType = getPieceType(target);

  switch (attackerType) {
    case 'pichu':
      return targetType === 'pichu';
    case 'pikachu':
      return targetType === 'pichu' || targetType === 'pikachu';
    case 'raichu':
      return true; // Raichu can capture any enemy
    default:
      return false;
  }
}

/** Get the forward direction for a player (+1 for white going down, -1 for black going up) */
export function forwardDir(player: Player): number {
  return player === 'white' ? 1 : -1;
}

/** Get the promotion row for a player */
export function promotionRow(player: Player): number {
  return player === 'white' ? 7 : 0;
}

/** Get the Raichu character for a player */
export function raichuChar(player: Player): PieceChar {
  return player === 'white' ? '@' : '$';
}
