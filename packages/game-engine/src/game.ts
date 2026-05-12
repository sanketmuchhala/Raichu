import type { Board, GameStatus, Move, PieceChar, Player } from '@raichu/shared-types';
import { BOARD_SIZE } from '@raichu/shared-types';
import { cloneBoard } from './board';
import { isWhitePiece, isBlackPiece, raichuChar, getOwner } from './pieces';
import { generateAllMoves } from './moves';

/** Apply a move to a board, returning a new board (does not mutate the original) */
export function applyMove(board: Board, move: Move): Board {
  const newBoard = cloneBoard(board);

  // Remove captured piece if any
  if (move.captured) {
    newBoard[move.captured.position.row][move.captured.position.col] = '.';
  }

  // Clear the origin square
  newBoard[move.from.row][move.from.col] = '.';

  // Place piece at destination (or promoted piece)
  newBoard[move.to.row][move.to.col] = move.promotion ?? move.piece;

  return newBoard;
}

/** Check if a position is on the promotion row for the given piece */
export function checkPromotion(row: number, piece: PieceChar): PieceChar | undefined {
  const owner = getOwner(piece);
  const promoRow = owner === 'white' ? BOARD_SIZE - 1 : 0;
  const type = piece === 'w' || piece === 'W' || piece === 'b' || piece === 'B'
    ? (piece.toLowerCase() === piece ? 'pichu' : 'pikachu')
    : 'raichu';

  if (row === promoRow && type !== 'raichu') {
    return raichuChar(owner);
  }
  return undefined;
}

/** Count pieces of each color on the board */
export function countPieces(board: Board): { white: number; black: number } {
  let white = 0;
  let black = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = board[r][c];
      if (isWhitePiece(cell)) white++;
      else if (isBlackPiece(cell)) black++;
    }
  }
  return { white, black };
}

/** Get the game status — playing, white wins, or black wins.
 *  Pass nextPlayer to also detect "no legal moves" losses. */
export function getGameStatus(board: Board, nextPlayer?: Player): GameStatus {
  const { white, black } = countPieces(board);
  if (black === 0) return 'white_wins';
  if (white === 0) return 'black_wins';
  if (nextPlayer !== undefined && generateAllMoves(board, nextPlayer).length === 0) {
    return nextPlayer === 'white' ? 'black_wins' : 'white_wins';
  }
  return 'playing';
}

/** Check if a move is in the legal move list (generate-and-match validation) */
export function isValidMove(board: Board, player: Player, move: Move): boolean {
  const legalMoves = generateAllMoves(board, player);
  return legalMoves.some(
    m =>
      m.from.row === move.from.row &&
      m.from.col === move.from.col &&
      m.to.row === move.to.row &&
      m.to.col === move.to.col
  );
}

/**
 * Format a move in human-readable notation.
 * Example: "w Pichu d3→e4" or "W Pikachu c5×d5 (captures b Pichu)"
 */
export function formatMoveHuman(move: Move): string {
  const typeNames: Record<string, string> = {
    w: 'Pichu', W: 'Pikachu', '@': 'Raichu',
    b: 'Pichu', B: 'Pikachu', $: 'Raichu',
  };

  const colLabels = 'abcdefgh';
  const from = `${colLabels[move.from.col]}${BOARD_SIZE - move.from.row}`;
  const to = `${colLabels[move.to.col]}${BOARD_SIZE - move.to.row}`;
  const pieceName = typeNames[move.piece] || move.piece;
  const arrow = move.captured ? '×' : '→';

  let text = `${move.piece} ${pieceName} ${from}${arrow}${to}`;

  if (move.captured) {
    const capName = typeNames[move.captured.piece] || move.captured.piece;
    text += ` (captures ${move.captured.piece} ${capName})`;
  }

  if (move.promotion) {
    text += ' ⇒ Raichu';
  }

  return text;
}

/**
 * Format a move in coordinate notation.
 * Example: "d3-e4" or "c5xd5"
 */
export function formatMoveCoordinate(move: Move): string {
  const colLabels = 'abcdefgh';
  const from = `${colLabels[move.from.col]}${BOARD_SIZE - move.from.row}`;
  const to = `${colLabels[move.to.col]}${BOARD_SIZE - move.to.row}`;
  const sep = move.captured ? 'x' : '-';
  return `${from}${sep}${to}`;
}
