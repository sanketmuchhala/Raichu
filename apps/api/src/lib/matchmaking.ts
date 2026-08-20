import { supabaseAdmin } from './supabase';
import { encodeBoard, createInitialBoard } from '@raichu/game-engine';
import { trackServerEvent } from './analytics';

/** Add a player to the matchmaking queue */
export async function joinQueue(playerId: string, eloRating: number) {
  // Upsert: single call instead of sequential delete + insert
  const { error } = await supabaseAdmin
    .from('matchmaking_queue')
    .upsert(
      { player_id: playerId, elo_rating: eloRating, queued_at: new Date().toISOString() },
      { onConflict: 'player_id' },
    );

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
    .maybeSingle();

  return data;
}

/** Get count of players currently in queue */
export async function getQueueCount(): Promise<number> {
  const { count } = await supabaseAdmin
    .from('matchmaking_queue')
    .select('*', { count: 'exact', head: true });

  return count ?? 0;
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
  const { data: queue, error: queueErr } = await supabaseAdmin
    .from('matchmaking_queue')
    .select('*')
    .order('queued_at', { ascending: true });

  if (queueErr) {
    throw new Error(`Failed to fetch queue: ${queueErr.message}`);
  }

  if (!queue || queue.length < 2) return 0;

  console.log(`Matchmaking: processing queue (${queue.length} players)`);

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
        // Match found — create game atomically with both players
        try {
          const whitePlayer = Math.random() < 0.5 ? player1 : player2;
          const blackPlayer = whitePlayer === player1 ? player2 : player1;

          const boardState = encodeBoard(createInitialBoard());

          // Single insert with both players and status='playing' — no intermediate state
          const { data: game, error: gameErr } = await supabaseAdmin
            .from('games')
            .insert({
              white_player_id: whitePlayer.player_id,
              black_player_id: blackPlayer.player_id,
              status: 'playing',
              board_state: boardState,
              current_player: 'white',
              game_type: 'ranked',
              difficulty: null,
              invite_code: null,
              move_count: 0,
            })
            .select('id')
            .single();

          if (gameErr || !game) {
            console.error('Matchmaking: failed to create game:', gameErr?.message);
            continue;
          }

          // Remove both from queue
          const { error: deleteErr } = await supabaseAdmin
            .from('matchmaking_queue')
            .delete()
            .in('player_id', [player1.player_id, player2.player_id]);

          if (deleteErr) {
            console.error('Matchmaking: failed to remove from queue:', deleteErr.message);
          }

          matched.add(player1.player_id);
          matched.add(player2.player_id);
          matchesMade++;

          // Real queue latency and the ELO gap actually accepted — neither is
          // observable from the browser.
          trackServerEvent('server_match_made', {
            gameId: game.id,
            eloDiff: Math.abs(player1.elo_rating - player2.elo_rating),
            eloRange,
            whiteWaitSeconds: Math.round(
              (Date.now() - new Date(whitePlayer.queued_at).getTime()) / 1000,
            ),
            blackWaitSeconds: Math.round(
              (Date.now() - new Date(blackPlayer.queued_at).getTime()) / 1000,
            ),
            queueDepth: queue.length,
          });

          console.log(
            `Matchmaking: paired ${whitePlayer.player_id.slice(0, 8)}(W) vs ${blackPlayer.player_id.slice(0, 8)}(B) → game ${game.id.slice(0, 8)}`,
          );
        } catch (err) {
          console.error('Matchmaking: unexpected error pairing players:', err instanceof Error ? err.message : err);
        }
        break;
      }
    }
  }

  return matchesMade;
}
