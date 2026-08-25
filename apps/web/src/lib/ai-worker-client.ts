'use client';

import type { SearchResult } from '@raichu/ai-engine';
import type { Board, Difficulty, Player } from '@raichu/shared-types';

export interface AiSearchRequest {
  id: number;
  board: Board;
  player: Player;
  difficulty: Difficulty;
}

export interface AiSearchResponse {
  id: number;
  result?: SearchResult;
  error?: string;
}

interface PendingSearch {
  resolve: (result: SearchResult) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

const SEARCH_TIMEOUT_MS = 10_000;

let aiWorker: Worker | null = null;
let nextRequestId = 0;
const pendingSearches = new Map<number, PendingSearch>();

function rejectPendingSearches(message: string) {
  for (const pending of pendingSearches.values()) {
    clearTimeout(pending.timeout);
    pending.reject(new Error(message));
  }
  pendingSearches.clear();
}

function resetWorker(message?: string) {
  aiWorker?.terminate();
  aiWorker = null;
  if (message) rejectPendingSearches(message);
}

function getWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;
  if (aiWorker) return aiWorker;

  const worker = new Worker(new URL('../workers/ai.worker.ts', import.meta.url), {
    type: 'module',
    name: 'raichu-ai',
  });

  worker.onmessage = (event: MessageEvent<AiSearchResponse>) => {
    const pending = pendingSearches.get(event.data.id);
    if (!pending) return;

    clearTimeout(pending.timeout);
    pendingSearches.delete(event.data.id);

    if (event.data.result) {
      pending.resolve(event.data.result);
    } else {
      pending.reject(new Error(event.data.error ?? 'AI worker returned no result'));
    }
  };

  worker.onerror = () => {
    resetWorker('AI worker failed');
  };

  aiWorker = worker;
  return worker;
}

/** Runs minimax away from the browser's rendering and input thread. */
export async function findBestMoveOffThread(
  board: Board,
  player: Player,
  difficulty: Difficulty,
): Promise<SearchResult> {
  const worker = getWorker();

  // Worker is absent in server/test environments. The browser path always
  // stays off-thread; this fallback keeps the store usable in unit tests.
  if (!worker) {
    const { findBestMove } = await import('@raichu/ai-engine');
    return findBestMove(board, player, difficulty);
  }

  const id = ++nextRequestId;
  const request: AiSearchRequest = { id, board, player, difficulty };

  return new Promise<SearchResult>((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingSearches.delete(id);
      resetWorker();
      reject(new Error('AI worker timed out'));
    }, SEARCH_TIMEOUT_MS);

    pendingSearches.set(id, { resolve, reject, timeout });
    worker.postMessage(request);
  });
}
