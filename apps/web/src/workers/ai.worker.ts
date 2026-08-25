/// <reference lib="webworker" />

import { findBestMove } from '@raichu/ai-engine';
import type { AiSearchRequest, AiSearchResponse } from '../lib/ai-worker-client';

const workerScope = self as DedicatedWorkerGlobalScope;

workerScope.onmessage = (event: MessageEvent<AiSearchRequest>) => {
  const { id, board, player, difficulty } = event.data;

  try {
    const result = findBestMove(board, player, difficulty);
    const response: AiSearchResponse = { id, result };
    workerScope.postMessage(response);
  } catch (error) {
    const response: AiSearchResponse = {
      id,
      error: error instanceof Error ? error.message : 'AI search failed',
    };
    workerScope.postMessage(response);
  }
};

export {};
