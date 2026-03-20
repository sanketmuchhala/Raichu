import { supabaseAdmin } from './supabase';
import { createGame } from './game-service';

/** Add a player to the matchmaking queue */
export async function joinQueue(playerId: string, eloRating: number) {
  // Remove from queue first (in case already queued)
  await supabaseAdmin
    .from('matchmaking_queue')
    .delete()
    .eq('player_id', playerId);

  const { error } = await supabaseAdmin
    .from('matchmaking_queue')
    .insert({ player_id: playerId, elo_rating: eloRating });

  if (error) throw new Error(`Failed to join queue: ${error.message}`);
}

/** Remove a player from the matchmaking queue */
export async function leaveQueue(playerId: string) {
  await supabaseAdmin
    .from('matchmaking_queue')
    .delete()
    .eq('player_id', playerId);
}

/** Check if a player is in the queue */
export async function getQueueStatus(playerId: string) {
  const { data } = await supabaseAdmin
    .from('matchmaking_queue')
    .select('*')
    .eq('player_id', playerId)
    .single();

  return data;
}

/**
 * Process the matchmaking queue.
 * Finds pairs within ELO range and creates ranked games.
 * ELO range expands over time:
 *   0-15s: +/- 100
 *   15-30s: +/- 200
 *   30-60s: +/- 400
 *   60s+: match anyone
 */
export async function processQueue(): Promise<number> {
  const { data: queue } = await supabaseAdmin
    .from('matchmaking_queue')
    .select('*')
    .order('queued_at', { ascending: true });

  if (!queue || queue.length < 2) return 0;

  let matchesMade = 0;
  const matched = new Set<string>();

  for (let i = 0; i < queue.length; i++) {
    const player1 = queue[i];
    if (matched.has(player1.player_id)) continue;

    const waitSeconds = (Date.now() - new Date(player1.queued_at).getTime()) / 1000;
    let eloRange = 100;
    if (waitSeconds > 60) eloRange = 9999;
    else if (waitSeconds > 30) eloRange = 400;
    else if (waitSeconds > 15) eloRange = 200;

    for (let j = i + 1; j < queue.length; j++) {
      const player2 = queue[j];
      if (matched.has(player2.player_id)) continue;

      const eloDiff = Math.abs(player1.elo_rating - player2.elo_rating);
      if (eloDiff <= eloRange) {
        // Match found — create game
        try {
          const whitePlayer = Math.random() < 0.5 ? player1 : player2;
          const blackPlayer = whitePlayer === player1 ? player2 : player1;

          const game = await createGame({
            playerId: whitePlayer.player_id,
            gameType: 'ranked',
            playAs: 'white',
          });

          // Assign black player
          await supabaseAdmin
            .from('games')
            .update({
              black_player_id: blackPlayer.player_id,
              status: 'playing',
            })
            .eq('id', game.id);

          // Remove both from queue
          await supabaseAdmin
            .from('matchmaking_queue')
            .delete()
            .in('player_id', [player1.player_id, player2.player_id]);

          matched.add(player1.player_id);
          matched.add(player2.player_id);
          matchesMade++;
        } catch {
          // Skip this pair on error
        }
        break;
      }
    }
  }

  return matchesMade;
}
