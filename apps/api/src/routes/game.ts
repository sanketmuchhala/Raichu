import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { Move } from '@raichu/shared-types';
import { requireAuth } from '../middleware/auth';
import {
  createGame,
  joinGameByInvite,
  getGame,
  getGameMoves,
  makeMove,
  resignGame,
  listUserGames,
} from '../lib/game-service';

export const gameRouter = Router();

// All game routes require authentication
gameRouter.use(requireAuth);

/** POST /games — Create a new game */
gameRouter.post('/games', async (req: Request, res: Response) => {
  const schema = z.object({
    gameType: z.enum(['friendly', 'ranked', 'bot']),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    playAs: z.enum(['white', 'black', 'random']).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    return;
  }

  try {
    const game = await createGame({
      playerId: req.user!.id,
      gameType: parsed.data.gameType,
      difficulty: parsed.data.difficulty,
      playAs: parsed.data.playAs,
    });
    res.status(201).json(game);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

/** GET /games/my — List current user's games */
gameRouter.get('/games/my', async (req: Request, res: Response) => {
  try {
    const games = await listUserGames(req.user!.id);
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

/** GET /games/:id — Get a game with player profiles */
gameRouter.get('/games/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const game = await getGame(req.params.id);
    res.json(game);
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'Game not found' });
  }
});

/** GET /games/:id/moves — Get move history */
gameRouter.get('/games/:id/moves', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const moves = await getGameMoves(req.params.id);
    res.json(moves);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

/** POST /games/:id/move — Make a move */
gameRouter.post('/games/:id/move', async (req: Request<{ id: string }>, res: Response) => {
  const moveSchema = z.object({
    from: z.object({ row: z.number().int().min(0).max(7), col: z.number().int().min(0).max(7) }),
    to: z.object({ row: z.number().int().min(0).max(7), col: z.number().int().min(0).max(7) }),
    piece: z.string().length(1),
    captured: z.object({
      position: z.object({ row: z.number().int().min(0).max(7), col: z.number().int().min(0).max(7) }),
      piece: z.string().length(1),
    }).optional(),
    promotion: z.string().length(1).optional(),
  });

  const parsed = moveSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid move format', details: parsed.error.issues });
    return;
  }

  try {
    const updatedGame = await makeMove(req.params.id, req.user!.id, parsed.data as unknown as Move);
    res.json(updatedGame);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message === 'Not your turn' || message === 'Invalid move' ? 400 : 500;
    res.status(status).json({ error: message });
  }
});

/** POST /games/:id/resign — Resign from a game */
gameRouter.post('/games/:id/resign', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const game = await resignGame(req.params.id, req.user!.id);
    res.json(game);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

/** POST /games/join/:code — Join a game by invite code */
gameRouter.post('/games/join/:code', async (req: Request<{ code: string }>, res: Response) => {
  try {
    const game = await joinGameByInvite(req.params.code, req.user!.id);
    res.json(game);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});
