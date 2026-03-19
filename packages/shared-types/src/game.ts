import type { Board } from './board';
import type { Move } from './moves';
import type { Player } from './pieces';

export type GameStatus = 'playing' | 'white_wins' | 'black_wins';

export type GameMode = 'pvp' | 'bot';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  moveHistory: Move[];
  status: GameStatus;
  moveCount: number;
  gameMode: GameMode;
  difficulty: Difficulty;
}
