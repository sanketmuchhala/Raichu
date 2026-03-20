import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { versionRouter } from './routes/version';
import { botRouter } from './routes/bot';
import { gameRouter } from './routes/game';
import { matchmakingRouter } from './routes/matchmaking';
import { errorHandler } from './middleware/error-handler';
import { startMatchmakingWorker } from './lib/matchmaking-worker';
import './types';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', healthRouter);
app.use('/api/v1', versionRouter);
app.use('/api/v1', botRouter);
app.use('/api/v1', gameRouter);
app.use('/api/v1', matchmakingRouter);

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Raichu API server running on port ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/v1/health`);
  console.log(`  Version: http://localhost:${PORT}/api/v1/version`);
  console.log(`  Bot: POST http://localhost:${PORT}/api/v1/bot/move`);
  console.log(`  Games: /api/v1/games/*`);
  console.log(`  Matchmaking: /api/v1/matchmaking/*`);

  // Start matchmaking worker
  startMatchmakingWorker();
});

export default app;
