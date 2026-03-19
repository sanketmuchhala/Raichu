import type { Move } from './moves';
import type { Difficulty } from './game';

/** POST /api/v1/bot/move request body */
export interface BotMoveRequest {
  board: string;
  player: 'w' | 'b';
  difficulty: Difficulty;
  timeBudget?: number;
}

/** POST /api/v1/bot/move response body */
export interface BotMoveResponse {
  move: Move;
  board: string;
  evaluation?: number;
  nodesSearched?: number;
  durationMs?: number;
}

/** GET /api/v1/health response */
export interface HealthResponse {
  status: 'ok';
}

/** GET /api/v1/version response */
export interface VersionResponse {
  version: string;
  engine: string;
}
