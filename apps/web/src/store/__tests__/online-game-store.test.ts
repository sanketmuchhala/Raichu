import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { OnlineGameDetail, Profile } from '@raichu/shared-types';
import { encodeBoard, createInitialBoard } from '@raichu/game-engine';

/**
 * Regression tests for the online multiplayer store.
 *
 * These cover the parts that only run during a live multiplayer game and so are
 * not exercised by any other test: the realtime update path (which had a bug
 * that blanked the joined player profiles) and the analytics events, which must
 * fire exactly once per game.
 *
 * Runs in vitest's default node environment. `trackEvent` no-ops without a
 * window, so assertions are made against the mocked analytics module.
 */

const ME = 'user-me';
const OPPONENT = 'user-opponent';

vi.mock('../../lib/api', () => ({
  gamesApi: {
    get: vi.fn(),
    getMoves: vi.fn(),
    move: vi.fn(),
    resign: vi.fn(),
  },
}));

vi.mock('../../lib/analytics', () => ({
  analytics: {
    onlineGameStarted: vi.fn(),
    onlineGameEnded: vi.fn(),
    onlineResigned: vi.fn(),
    invalidMove: vi.fn(),
  },
}));

vi.mock('../auth-store', () => ({
  useAuthStore: { getState: () => ({ user: { id: ME } }) },
}));

function profile(id: string, username: string): Profile {
  return {
    id,
    username,
    display_name: username,
    avatar_url: null,
    elo_rating: 1200,
    games_played: 0,
    games_won: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };
}

function game(id: string, overrides: Partial<OnlineGameDetail> = {}): OnlineGameDetail {
  return {
    id,
    white_player_id: ME,
    black_player_id: OPPONENT,
    status: 'playing',
    board_state: encodeBoard(createInitialBoard()),
    current_player: 'white',
    game_type: 'ranked',
    difficulty: null,
    invite_code: null,
    move_count: 0,
    winner_id: null,
    winner_elo_delta: null,
    loser_elo_delta: null,
    created_at: new Date(Date.now() - 60_000).toISOString(),
    updated_at: new Date().toISOString(),
    finished_at: null,
    white_player: profile(ME, 'me'),
    black_player: profile(OPPONENT, 'them'),
    ...overrides,
  };
}

/**
 * The store keeps module-level Sets of already-reported game ids, so each test
 * needs a fresh module registry or the second test would see the first test's
 * game as already tracked.
 */
async function freshStore() {
  vi.resetModules();
  const { useOnlineGameStore } = await import('../online-game-store');
  const { analytics } = await import('../../lib/analytics');
  const { gamesApi } = await import('../../lib/api');
  return { store: useOnlineGameStore, analytics, gamesApi };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('handleGameUpdate', () => {
  it('keeps joined player profiles when a raw realtime row arrives', async () => {
    const { store } = await freshStore();

    store.setState({ game: game('g1') });

    // Supabase Realtime delivers the bare `games` row — no joined profiles.
    // Assigning it wholesale used to blank the player panels on every move.
    const rawRow = {
      ...game('g1'),
      move_count: 1,
      current_player: 'black',
      white_player: undefined,
      black_player: undefined,
    } as unknown as OnlineGameDetail;

    store.getState().handleGameUpdate(rawRow);

    const updated = store.getState().game;
    expect(updated?.white_player?.username).toBe('me');
    expect(updated?.black_player?.username).toBe('them');
    // The actual update still applied.
    expect(updated?.move_count).toBe(1);
    expect(store.getState().currentPlayer).toBe('black');
  });

  it('prefers profiles present on the incoming row over the cached ones', async () => {
    const { store } = await freshStore();

    store.setState({ game: game('g1') });
    store.getState().handleGameUpdate(
      game('g1', { black_player: profile(OPPONENT, 'renamed') }),
    );

    expect(store.getState().game?.black_player?.username).toBe('renamed');
  });
});

describe('online_game_started', () => {
  it('fires once no matter how many updates arrive', async () => {
    const { store, analytics } = await freshStore();

    store.getState().handleGameUpdate(game('g2'));
    store.getState().handleGameUpdate(game('g2', { move_count: 1 }));
    store.getState().handleGameUpdate(game('g2', { move_count: 2 }));

    expect(analytics.onlineGameStarted).toHaveBeenCalledTimes(1);
    expect(analytics.onlineGameStarted).toHaveBeenCalledWith(
      expect.objectContaining({ gameId: 'g2', gameType: 'ranked', myColor: 'white' }),
      ME,
    );
  });

  it('does not fire for a game still waiting for an opponent', async () => {
    const { store, analytics } = await freshStore();

    store.getState().handleGameUpdate(game('g3', { status: 'waiting' }));

    expect(analytics.onlineGameStarted).not.toHaveBeenCalled();
  });
});

describe('online_game_ended', () => {
  it('reports a win with the winner ELO delta', async () => {
    const { store, analytics } = await freshStore();

    store.getState().handleGameUpdate(game('g4'));
    store.getState().handleGameUpdate(
      game('g4', {
        status: 'white_wins',
        winner_id: ME,
        move_count: 21,
        winner_elo_delta: 12,
        loser_elo_delta: -12,
      }),
    );

    expect(analytics.onlineGameEnded).toHaveBeenCalledTimes(1);
    expect(analytics.onlineGameEnded).toHaveBeenCalledWith(
      expect.objectContaining({
        gameId: 'g4',
        status: 'white_wins',
        won: true,
        myColor: 'white',
        moveCount: 21,
        eloDelta: 12,
      }),
      ME,
    );
  });

  it('reports a loss with the loser ELO delta', async () => {
    const { store, analytics } = await freshStore();

    store.getState().handleGameUpdate(game('g5'));
    store.getState().handleGameUpdate(
      game('g5', {
        status: 'black_wins',
        winner_id: OPPONENT,
        winner_elo_delta: 12,
        loser_elo_delta: -12,
      }),
    );

    const [payload] = vi.mocked(analytics.onlineGameEnded).mock.calls[0];
    expect(payload.won).toBe(false);
    expect(payload.eloDelta).toBe(-12);
  });

  it('fires once even if the terminal row is delivered repeatedly', async () => {
    const { store, analytics } = await freshStore();

    const finished = game('g6', { status: 'white_wins', winner_id: ME });
    store.getState().handleGameUpdate(finished);
    store.getState().handleGameUpdate(finished);
    store.getState().handleGameUpdate(finished);

    expect(analytics.onlineGameEnded).toHaveBeenCalledTimes(1);
  });
});

describe('resign', () => {
  it('emits online_resigned', async () => {
    const { store, analytics, gamesApi } = await freshStore();
    vi.mocked(gamesApi.resign).mockResolvedValue({} as never);

    store.setState({ game: game('g7', { move_count: 9 }) });
    await store.getState().resign();

    expect(gamesApi.resign).toHaveBeenCalledWith('g7');
    expect(analytics.onlineResigned).toHaveBeenCalledWith(
      { gameId: 'g7', moveCount: 9 },
      ME,
    );
  });

  it('surfaces an error when the request fails', async () => {
    const { store, gamesApi } = await freshStore();
    vi.mocked(gamesApi.resign).mockRejectedValue(new Error('network down'));

    store.setState({ game: game('g8') });
    await store.getState().resign();

    expect(store.getState().error).toBe('network down');
  });
});

describe('submitMove', () => {
  it('records a rejected move separately from the transport error', async () => {
    const { store, analytics, gamesApi } = await freshStore();
    vi.mocked(gamesApi.move).mockRejectedValue(new Error('Not your turn'));

    store.setState({ game: game('g9') });
    await store.getState().submitMove({
      from: { row: 1, col: 0 },
      to: { row: 2, col: 0 },
      piece: 'w',
    });

    expect(analytics.invalidMove).toHaveBeenCalledWith(
      { mode: 'online', reason: 'Not your turn' },
      ME,
    );
    expect(store.getState().error).toBe('Not your turn');
    expect(store.getState().isThinking).toBe(false);
  });
});
