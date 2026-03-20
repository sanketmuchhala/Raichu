import { supabaseAdmin } from './supabase';

/** Increment games_played for a player */
export async function incrementGamesPlayed(playerId: string): Promise<void> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('games_played')
    .eq('id', playerId)
    .single();
  if (data) {
    await supabaseAdmin
      .from('profiles')
      .update({ games_played: (data.games_played as number) + 1 })
      .eq('id', playerId);
  }
}

/** Update stats when a game finishes */
export async function updatePlayerStats(
  winnerId: string,
  loserId: string,
): Promise<void> {
  // Fetch both profiles
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, games_played, games_won')
    .in('id', [winnerId, loserId]);

  if (!profiles || profiles.length !== 2) return;

  const winner = profiles.find((p) => p.id === winnerId);
  const loser = profiles.find((p) => p.id === loserId);
  if (!winner || !loser) return;

  // Update winner
  await supabaseAdmin
    .from('profiles')
    .update({
      games_played: winner.games_played + 1,
      games_won: winner.games_won + 1,
    })
    .eq('id', winnerId);

  // Update loser
  await supabaseAdmin
    .from('profiles')
    .update({
      games_played: loser.games_played + 1,
    })
    .eq('id', loserId);
}
