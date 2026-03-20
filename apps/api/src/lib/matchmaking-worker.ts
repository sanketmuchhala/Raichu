import { processQueue } from './matchmaking';
import { isSupabaseConfigured } from './supabase';

let intervalId: ReturnType<typeof setInterval> | null = null;
let consecutiveFailures = 0;
const MAX_FAILURES = 3;

/** Start the matchmaking worker (runs every 5 seconds) */
export function startMatchmakingWorker() {
  if (intervalId) return;

  if (!isSupabaseConfigured) {
    console.warn('Matchmaking worker not started — Supabase is not configured');
    return;
  }

  console.log('Matchmaking worker started (5s interval)');
  consecutiveFailures = 0;

  intervalId = setInterval(async () => {
    try {
      const matches = await processQueue();
      consecutiveFailures = 0;
      if (matches > 0) {
        console.log(`Matchmaking: created ${matches} match(es)`);
      }
    } catch (err) {
      consecutiveFailures++;
      if (consecutiveFailures <= MAX_FAILURES) {
        console.error('Matchmaking error:', err instanceof Error ? err.message : err);
      }
      if (consecutiveFailures === MAX_FAILURES) {
        console.error(
          `Matchmaking: ${MAX_FAILURES} consecutive failures — pausing worker. Check Supabase connectivity.`,
        );
        stopMatchmakingWorker();
      }
    }
  }, 5000);
}

/** Stop the matchmaking worker */
export function stopMatchmakingWorker() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('Matchmaking worker stopped');
  }
}
