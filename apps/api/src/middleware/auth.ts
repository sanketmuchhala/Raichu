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

  const user = await getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = user;
  next();
}

/** Attach user if token is present, but don't block if absent. */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractToken(req);
  if (token) {
    const user = await getUserFromToken(token);
    if (user) req.user = user;
  }
  next();
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7);
}
