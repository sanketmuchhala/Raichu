import type { Request, Response, NextFunction } from 'express';
import { getUserFromToken } from '../lib/supabase';
import '../types';

/** Require a valid Supabase JWT. Returns 401 if missing or invalid. */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const user = await getUserFromToken(token);
    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err instanceof Error ? err.message : err);
    res.status(503).json({ error: 'Authentication service unavailable' });
  }
}

/** Attach user if token is present, but don't block if absent. */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractToken(req);
    if (token) {
      const user = await getUserFromToken(token);
      if (user) req.user = user;
    }
  } catch {
    // Swallow — optional auth shouldn't block requests
  }
  next();
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7);
}
