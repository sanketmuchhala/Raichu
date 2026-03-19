import { Router } from 'express';

export const versionRouter = Router();

versionRouter.get('/version', (_req, res) => {
  res.json({
    version: '1.0.0',
    engine: '1.0.0',
  });
});
