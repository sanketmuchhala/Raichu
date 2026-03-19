import type { Position } from './board';
import type { PieceChar } from './pieces';

/** A fully-described move with all metadata for history and animation */
export interface Move {
  from: Position;
  to: Position;
  piece: PieceChar;
  captured?: {
    position: Position;
    piece: PieceChar;
  };
  /** If the piece promoted on landing, this is the new piece char ('@' or '$') */
  promotion?: PieceChar;
}
