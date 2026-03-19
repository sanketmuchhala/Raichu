import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { versionRouter } from './routes/version';
import { botRouter } from './routes/bot';
import { errorHandler } from './middleware/error-handler';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', healthRouter);
app.use('/api/v1', versionRouter);
app.use('/api/v1', botRouter);

// TODO: Future multiplayer routes
// app.use('/api/v1/games', gameRouter);
// TODO: WebSocket upgrade handler for real-time multiplayer
// import { createServer } from 'http';
// import { WebSocketServer } from 'ws';
// const server = createServer(app);
// const wss = new WebSocketServer({ server, path: '/ws' });
// wss.on('connection', (ws) => { /* handle multiplayer sessions */ });

// TODO: Future middleware for multiplayer
// app.use(sessionMiddleware);  // Session management
// app.use(authMiddleware);     // Authentication
// app.use(rateLimitMiddleware); // Rate limiting

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Raichu API server running on port ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/v1/health`);
  console.log(`  Version: http://localhost:${PORT}/api/v1/version`);
  console.log(`  Bot: POST http://localhost:${PORT}/api/v1/bot/move`);
});

export default app;
