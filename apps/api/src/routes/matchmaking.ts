import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import { joinQueue, leaveQueue, getQueueStatus, getQueueCount } from '../lib/matchmaking';

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

    // Join queue and get count in parallel
    const [, queueCount] = await Promise.all([
      joinQueue(req.user!.id, profile.elo_rating as number),
      getQueueCount(),
    ]);

    res.json({ status: 'queued', queueCount });
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
    // First check if still in queue
    const queueEntry = await getQueueStatus(req.user!.id);

    if (queueEntry) {
      const waitSeconds = Math.floor(
        (Date.now() - new Date(queueEntry.queued_at).getTime()) / 1000,
      );
      const queueCount = await getQueueCount();
      res.json({ status: 'queued', waitSeconds, queueCount });
      return;
    }

    // Not in queue — check if just matched (recent ranked game with this player)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentGame } = await supabaseAdmin
      .from('games')
      .select('id')
      .eq('game_type', 'ranked')
      .in('status', ['waiting', 'playing'])
      .or(`white_player_id.eq.${req.user!.id},black_player_id.eq.${req.user!.id}`)
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentGame) {
      res.json({ status: 'matched', gameId: recentGame.id });
    } else {
      res.json({ status: 'idle' });
    }
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});
