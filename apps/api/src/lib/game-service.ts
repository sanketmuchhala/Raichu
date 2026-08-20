import type { Move, Player } from '@raichu/shared-types';
import {
  decodeBoard,
  encodeBoard,
  applyMove,
  getGameStatus,
  isValidMove,
  createInitialBoard,
} from '@raichu/game-engine';
import { supabaseAdmin } from './supabase';
import { generateInviteCode } from './invite-code';
import { updatePlayerStats } from './player-stats';
import { calculateElo } from './elo';
import { trackServerEvent } from './analytics';

type GameType = 'friendly' | 'ranked' | 'bot';

interface CreateGameOpts {
  playerId: string;
  gameType: GameType;
  difficulty?: string;
  playAs?: 'white' | 'black' | 'random';
}

/** Create a new online game */
export async function createGame(opts: CreateGameOpts) {
  const { playerId, gameType, difficulty, playAs = 'white' } = opts;

  const chosenColor =
    playAs === 'random'
      ? (Math.random() < 0.5 ? 'white' : 'black')
      : playAs;

  const boardState = encodeBoard(createInitialBoard());
  const inviteCode = gameType === 'friendly' ? generateInviteCode() : null;

  const gameData = {
    white_player_id: chosenColor === 'white' ? playerId : null,
    black_player_id: chosenColor === 'black' ? playerId : null,
    status: 'waiting',
    board_state: boardState,
    current_player: 'white',
    game_type: gameType,
    difficulty: gameType === 'bot' ? (difficulty || 'medium') : null,
    invite_code: inviteCode,
    move_count: 0,
  };

  const { data, error } = await supabaseAdmin
    .from('games')
    .insert(gameData)
    .select()
    .single();

  if (error) throw new Error(`Failed to create game: ${error.message}`);

  trackServerEvent(
    'server_game_created',
    { gameId: data.id, gameType, difficulty: gameData.difficulty, playAs: chosenColor },
    playerId,
  );

  return data;
}

/** Join an existing game by invite code */
export async function joinGameByInvite(inviteCode: string, playerId: string) {
  // Find the game
  const { data: game, error: findErr } = await supabaseAdmin
    .from('games')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .eq('status', 'waiting')
    .single();

  if (findErr || !game) throw new Error('Game not found or already started');

  // Can't join your own game
  if (game.white_player_id === playerId || game.black_player_id === playerId) {
    throw new Error('You are already in this game');
  }

  // Fill the empty slot
  const update: Record<string, string> = { status: 'playing' };
  if (!game.white_player_id) {
    update.white_player_id = playerId;
  } else {
    update.black_player_id = playerId;
  }

  const { data, error } = await supabaseAdmin
    .from('games')
    .update(update)
    .eq('id', game.id)
    .select()
    .single();

  if (error) throw new Error(`Failed to join game: ${error.message}`);
  return data;
}

/** Get a game with player profiles */
export async function getGame(gameId: string) {
  const { data, error } = await supabaseAdmin
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (error || !data) throw new Error('Game not found');

  // Fetch player profiles
  const playerIds = [data.white_player_id, data.black_player_id].filter(Boolean);
  let whitePlayer = null;
  let blackPlayer = null;

  if (playerIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('id', playerIds);

    if (profiles) {
      whitePlayer = profiles.find((p) => p.id === data.white_player_id) || null;
      blackPlayer = profiles.find((p) => p.id === data.black_player_id) || null;
    }
  }

  return { ...data, white_player: whitePlayer, black_player: blackPlayer };
}

/** Get move history for a game */
export async function getGameMoves(gameId: string) {
  const { data, error } = await supabaseAdmin
    .from('moves')
    .select('*')
    .eq('game_id', gameId)
    .order('move_number', { ascending: true });

  if (error) throw new Error(`Failed to fetch moves: ${error.message}`);
  return data || [];
}

/** Make a move in an online game */
export async function makeMove(
  gameId: string,
  playerId: string,
  move: Move,
) {
  // 1. Load game
  const { data: game, error: gameErr } = await supabaseAdmin
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (gameErr || !game) throw new Error('Game not found');
  if (game.status !== 'playing') throw new Error('Game is not in progress');

  // 2. Verify it's the player's turn
  const currentColor = game.current_player as 'white' | 'black';
  const expectedPlayerId =
    currentColor === 'white' ? game.white_player_id : game.black_player_id;

  if (playerId !== expectedPlayerId) {
    throw new Error('Not your turn');
  }

  // 3. Validate move
  const board = decodeBoard(game.board_state);
  const player: Player = currentColor;

  if (!isValidMove(board, player, move)) {
    throw new Error('Invalid move');
  }

  // 4. Apply move
  const newBoard = applyMove(board, move);
  const newBoardStr = encodeBoard(newBoard);
  const newStatus = getGameStatus(newBoard);
  const nextPlayer = currentColor === 'white' ? 'black' : 'white';
  const newMoveNumber = game.move_count + 1;

  // 5. Insert move record
  const { error: moveErr } = await supabaseAdmin.from('moves').insert({
    game_id: gameId,
    move_number: newMoveNumber,
    player: currentColor,
    from_row: move.from.row,
    from_col: move.from.col,
    to_row: move.to.row,
    to_col: move.to.col,
    piece: move.piece,
    captured_piece: move.captured?.piece || null,
    captured_row: move.captured?.position.row ?? null,
    captured_col: move.captured?.position.col ?? null,
    promotion: move.promotion || null,
    board_after: newBoardStr,
  });

  if (moveErr) throw new Error(`Failed to save move: ${moveErr.message}`);

  // 6. Update game
  const gameUpdate: Record<string, unknown> = {
    board_state: newBoardStr,
    current_player: nextPlayer,
    move_count: newMoveNumber,
  };

  // Check for game over
  if (newStatus !== 'playing') {
    gameUpdate.status = newStatus;
    gameUpdate.finished_at = new Date().toISOString();

    const winnerId =
      newStatus === 'white_wins' ? game.white_player_id : game.black_player_id;
    const loserId =
      newStatus === 'white_wins' ? game.black_player_id : game.white_player_id;

    if (winnerId) gameUpdate.winner_id = winnerId;

    // Update player stats and ELO if both players are real
    if (winnerId && loserId) {
      await updatePlayerStats(winnerId, loserId);

      // Calculate ELO for ranked games
      if (game.game_type === 'ranked') {
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('id, elo_rating, games_played')
          .in('id', [winnerId, loserId]);

        if (profiles && profiles.length === 2) {
          const winnerProfile = profiles.find((p) => p.id === winnerId)!;
          const loserProfile = profiles.find((p) => p.id === loserId)!;
          const elo = calculateElo(
            winnerProfile.elo_rating as number,
            winnerProfile.games_played as number,
            loserProfile.elo_rating as number,
            loserProfile.games_played as number,
          );

          gameUpdate.winner_elo_delta = elo.winnerDelta;
          gameUpdate.loser_elo_delta = elo.loserDelta;

          // Update player ELO ratings
          await supabaseAdmin
            .from('profiles')
            .update({ elo_rating: elo.winnerNewElo })
            .eq('id', winnerId);
          await supabaseAdmin
            .from('profiles')
            .update({ elo_rating: elo.loserNewElo })
            .eq('id', loserId);
        }
      }
    }
  }

  const { data: updatedGame, error: updateErr } = await supabaseAdmin
    .from('games')
    .update(gameUpdate)
    .eq('id', gameId)
    .select()
    .single();

  if (updateErr) throw new Error(`Failed to update game: ${updateErr.message}`);

  if (newStatus !== 'playing') {
    trackServerEvent('server_game_finished', {
      gameId,
      gameType: game.game_type,
      status: newStatus,
      reason: 'checkmate',
      moveCount: newMoveNumber,
      winnerId: gameUpdate.winner_id ?? null,
      winnerEloDelta: gameUpdate.winner_elo_delta ?? null,
      loserEloDelta: gameUpdate.loser_elo_delta ?? null,
      durationMs: Date.now() - new Date(game.created_at).getTime(),
    });
  }

  return updatedGame;
}

/** Resign from a game */
export async function resignGame(gameId: string, playerId: string) {
  const { data: game, error: gameErr } = await supabaseAdmin
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (gameErr || !game) throw new Error('Game not found');
  if (game.status !== 'playing' && game.status !== 'waiting') {
    throw new Error('Game is already finished');
  }

  const isWhite = game.white_player_id === playerId;
  const isBlack = game.black_player_id === playerId;
  if (!isWhite && !isBlack) throw new Error('You are not in this game');

  const winnerStatus = isWhite ? 'black_wins' : 'white_wins';
  const winnerId = isWhite ? game.black_player_id : game.white_player_id;

  const update: Record<string, unknown> = {
    status: game.status === 'waiting' ? 'abandoned' : winnerStatus,
    finished_at: new Date().toISOString(),
  };

  if (winnerId && game.status === 'playing') {
    update.winner_id = winnerId;
    await updatePlayerStats(winnerId, playerId);
  }

  const { data, error } = await supabaseAdmin
    .from('games')
    .update(update)
    .eq('id', gameId)
    .select()
    .single();

  if (error) throw new Error(`Failed to resign: ${error.message}`);

  trackServerEvent(
    'server_game_finished',
    {
      gameId,
      gameType: game.game_type,
      status: update.status,
      reason: 'resign',
      moveCount: game.move_count,
      winnerId: winnerId ?? null,
      durationMs: Date.now() - new Date(game.created_at).getTime(),
    },
    playerId,
  );

  return data;
}

/** List a user's games (active + recent finished) */
export async function listUserGames(playerId: string) {
  const { data, error } = await supabaseAdmin
    .from('games')
    .select('*')
    .or(`white_player_id.eq.${playerId},black_player_id.eq.${playerId}`)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(`Failed to list games: ${error.message}`);
  return data || [];
}
