/** Game types for online multiplayer */
export type GameType = 'friendly' | 'ranked' | 'bot';

/** Status of an online game */
export type OnlineGameStatus =
  | 'waiting'
  | 'playing'
  | 'white_wins'
  | 'black_wins'
  | 'abandoned';

/** User profile (mirrors the `profiles` DB table) */
export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  elo_rating: number;
  games_played: number;
  games_won: number;
  created_at: string;
  updated_at: string;
}

/** Online game record (mirrors the `games` DB table) */
export interface OnlineGame {
  id: string;
  white_player_id: string | null;
  black_player_id: string | null;
  status: OnlineGameStatus;
  board_state: string;
  current_player: 'white' | 'black';
  game_type: GameType;
  difficulty: string | null;
  invite_code: string | null;
  move_count: number;
  winner_id: string | null;
  winner_elo_delta: number | null;
  loser_elo_delta: number | null;
  created_at: string;
  updated_at: string;
  finished_at: string | null;
}

/** Single move record (mirrors the `moves` DB table) */
export interface GameMove {
  id: string;
  game_id: string;
  move_number: number;
  player: 'white' | 'black';
  from_row: number;
  from_col: number;
  to_row: number;
  to_col: number;
  piece: string;
  captured_piece: string | null;
  captured_row: number | null;
  captured_col: number | null;
  promotion: string | null;
  board_after: string;
  created_at: string;
}

/** Online game with joined player profiles */
export interface OnlineGameDetail extends OnlineGame {
  white_player: Profile | null;
  black_player: Profile | null;
  moves?: GameMove[];
}
