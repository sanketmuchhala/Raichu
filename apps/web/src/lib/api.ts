import { getSupabaseBrowserClient } from './supabase/client';

/** Get current JWT from Supabase session */
async function getToken(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/** Typed fetch wrapper that attaches JWT auth header */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

/** API methods for online games */
export const gamesApi = {
  create: (data: { gameType: string; difficulty?: string; playAs?: string }) =>
    apiFetch('/api/v1/games', { method: 'POST', body: JSON.stringify(data) }),

  get: (id: string) =>
    apiFetch(`/api/v1/games/${id}`),

  getMoves: (id: string) =>
    apiFetch(`/api/v1/games/${id}/moves`),

  myGames: () =>
    apiFetch('/api/v1/games/my'),

  move: (id: string, move: unknown) =>
    apiFetch(`/api/v1/games/${id}/move`, { method: 'POST', body: JSON.stringify(move) }),

  resign: (id: string) =>
    apiFetch(`/api/v1/games/${id}/resign`, { method: 'POST' }),

  joinByCode: (code: string) =>
    apiFetch(`/api/v1/games/join/${code}`, { method: 'POST' }),
};
