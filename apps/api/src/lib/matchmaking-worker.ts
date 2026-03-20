import { processQueue } from './matchmaking';

let intervalId: ReturnType<typeof setInterval> | null = null;

/** Start the matchmaking worker (runs every 5 seconds) */
export function startMatchmakingWorker() {
  if (intervalId) return;

  console.log('Matchmaking worker started (5s interval)');

  intervalId = setInterval(async () => {
    try {
      const matches = await processQueue();
      if (matches > 0) {
        console.log(`Matchmaking: created ${matches} match(es)`);
      }
    } catch (err) {
      console.error('Matchmaking error:', err instanceof Error ? err.message : err);
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
