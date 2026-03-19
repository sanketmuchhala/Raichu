import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { decodeBoard, encodeBoard } from '@raichu/game-engine';
import { findBestMove } from '@raichu/ai-engine';

export const botRouter = Router();

const VALID_CELL_CHARS = /^[.wWbB@$]+$/;

const botMoveSchema = z.object({
  board: z.string()
    .length(64, 'Board string must be exactly 64 characters')
    .regex(VALID_CELL_CHARS, 'Board contains invalid characters'),
  player: z.enum(['w', 'b']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeBudget: z.number().positive().optional(),
});

botRouter.post('/bot/move', (req: Request, res: Response) => {
  const parsed = botMoveSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid request',
      details: parsed.error.issues,
    });
    return;
  }

  const { board: boardStr, player, difficulty, timeBudget } = parsed.data;

  try {
    const board = decodeBoard(boardStr);
    const enginePlayer = player === 'w' ? 'white' : 'black';

    const result = findBestMove(board, enginePlayer as 'white' | 'black', difficulty, timeBudget);

    if (!result.move || !result.board) {
      res.status(200).json({
        error: 'No legal moves available',
        board: boardStr,
      });
      return;
    }

    res.json({
      move: result.move,
      board: encodeBoard(result.board),
      evaluation: result.evaluation,
      nodesSearched: result.nodesSearched,
      depth: result.depth,
      durationMs: result.durationMs,
    });
  } catch (err) {
    res.status(500).json({
      error: 'Internal server error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});
