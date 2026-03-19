import { Router } from 'express';

// TODO: Future multiplayer game session routes
// These will be implemented when adding real-time multiplayer support.

export const gameRouter = Router();

// TODO: POST /games — Create a new game session
// gameRouter.post('/', async (req, res) => {
//   const { mode, timeControl } = req.body;
//   // Create game in database
//   // Return game ID and join link
// });

// TODO: GET /games/:id — Get game state
// gameRouter.get('/:id', async (req, res) => {
//   // Fetch game from database
//   // Return current board, move history, players
// });

// TODO: POST /games/:id/move — Make a move in a game
// gameRouter.post('/:id/move', async (req, res) => {
//   // Validate move via engine
//   // Apply move to authoritative server state
//   // Broadcast update via WebSocket
// });

// TODO: POST /games/:id/resign — Resign from a game
// TODO: POST /games/:id/draw — Offer/accept draw

// TODO: Matchmaking
// POST /matchmaking/queue — Join matchmaking queue
// DELETE /matchmaking/queue — Leave queue
