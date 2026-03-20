import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import { joinQueue, leaveQueue, getQueueStatus } from '../lib/matchmaking';

export const matchmakingRouter = Router();

matchmakingRouter.use(requireAuth);

/** POST /matchmaking/queue — Join matchmaking queue */
matchmakingRouter.post('/matchmaking/queue', async (req: Request, res: Response) => {
  try {
    // Get player's current ELO
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('elo_rating')
      .eq('id', req.user!.id)
      .single();

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    await joinQueue(req.user!.id, profile.elo_rating as number);
    res.json({ status: 'queued' });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

/** DELETE /matchmaking/queue — Leave matchmaking queue */
matchmakingRouter.delete('/matchmaking/queue', async (req: Request, res: Response) => {
  try {
    await leaveQueue(req.user!.id);
    res.json({ status: 'left' });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

/** GET /matchmaking/status — Check queue status & matched game */
matchmakingRouter.get('/matchmaking/status', async (req: Request, res: Response) => {
  try {
    const queueEntry = await getQueueStatus(req.user!.id);

    if (queueEntry) {
      const waitSeconds = Math.floor(
        (Date.now() - new Date(queueEntry.queued_at).getTime()) / 1000,
      );
      res.json({ status: 'queued', waitSeconds });
      return;
    }

    // Check if player was just matched (has a recent playing game where they didn't create it)
    const { data: recentGame } = await supabaseAdmin
      .from('games')
      .select('id')
      .eq('game_type', 'ranked')
      .eq('status', 'playing')
      .or(`white_player_id.eq.${req.user!.id},black_player_id.eq.${req.user!.id}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (recentGame) {
      res.json({ status: 'matched', gameId: recentGame.id });
    } else {
      res.json({ status: 'idle' });
    }
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});
