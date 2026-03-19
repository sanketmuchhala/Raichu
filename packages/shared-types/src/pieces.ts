/** Single-character piece representations matching the game spec */
export type WhitePieceChar = 'w' | 'W' | '@';
export type BlackPieceChar = 'b' | 'B' | '$';
export type PieceChar = WhitePieceChar | BlackPieceChar;
export type CellValue = PieceChar | '.';

export type Player = 'white' | 'black';
export type PieceType = 'pichu' | 'pikachu' | 'raichu';

export const WHITE_PIECES: readonly WhitePieceChar[] = ['w', 'W', '@'] as const;
export const BLACK_PIECES: readonly BlackPieceChar[] = ['b', 'B', '$'] as const;

export const PIECE_TYPE_MAP: Record<PieceChar, PieceType> = {
  w: 'pichu', W: 'pikachu', '@': 'raichu',
  b: 'pichu', B: 'pikachu', $: 'raichu',
};

export const PIECE_OWNER_MAP: Record<PieceChar, Player> = {
  w: 'white', W: 'white', '@': 'white',
  b: 'black', B: 'black', $: 'black',
};
