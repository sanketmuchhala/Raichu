'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUIStore } from '../../../store/ui-store';
import { THEMES } from '../../../lib/themes';
import { useAuthStore } from '../../../store/auth-store';
import { useOnlineGameStore } from '../../../store/online-game-store';
import { useGameSubscription } from '../../../lib/supabase/use-game-subscription';
import { BoardProvider } from '../../../components/board/BoardContext';
import { OnlineBoard } from '../../../components/board/OnlineBoard';
import { WaitingRoom } from '../../../components/game/WaitingRoom';
import { GameOverOverlay } from '../../../components/game/GameOverOverlay';
import { PlayerBar } from '../../../components/game/PlayerBar';

export default function OnlineGamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const theme = useUIStore((s) => THEMES[s.theme]);
  const user = useAuthStore((s) => s.user);

  const game = useOnlineGameStore((s) => s.game);
  const board = useOnlineGameStore((s) => s.board);
  const currentPlayer = useOnlineGameStore((s) => s.currentPlayer);
  const status = useOnlineGameStore((s) => s.status);
  const selectedPiece = useOnlineGameStore((s) => s.selectedPiece);
  const legalMoves = useOnlineGameStore((s) => s.legalMoves);
  const lastMove = useOnlineGameStore((s) => s.lastMove);
  const isThinking = useOnlineGameStore((s) => s.isThinking);
  const myColor = useOnlineGameStore((s) => s.myColor);
  const loading = useOnlineGameStore((s) => s.loading);
  const error = useOnlineGameStore((s) => s.error);
  const loadGame = useOnlineGameStore((s) => s.loadGame);
  const selectPiece = useOnlineGameStore((s) => s.selectPiece);
  const submitMove = useOnlineGameStore((s) => s.submitMove);
  const clearSelection = useOnlineGameStore((s) => s.clearSelection);
  const resign = useOnlineGameStore((s) => s.resign);
  const reset = useOnlineGameStore((s) => s.reset);

  // Subscribe to Realtime updates
  useGameSubscription(gameId);

  // Load game on mount
  useEffect(() => {
    loadGame(gameId);
    return () => reset();
  }, [gameId, loadGame, reset]);

  // Set myColor once game + user are available
  useEffect(() => {
    if (!game || !user) return;
    if (game.white_player_id === user.id) {
      useOnlineGameStore.setState({ myColor: 'white' });
    } else if (game.black_player_id === user.id) {
      useOnlineGameStore.setState({ myColor: 'black' });
    }
  }, [game, user]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bgPrimary }}>
        <p style={{ color: theme.textSecondary }}>Loading game...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: theme.bgPrimary }}>
        <p style={{ color: '#ef4444' }}>{error}</p>
        <Link href="/lobby" className="text-sm hover:underline" style={{ color: theme.accent }}>
          Back to Lobby
        </Link>
      </main>
    );
  }

  if (!game) return null;

  const isWaiting = game.status === 'waiting';
  const isFinished = game.status !== 'waiting' && game.status !== 'playing';
  const canInteract = !isThinking && myColor === currentPlayer && status === 'playing';

  // Determine which player is on top / bottom based on myColor
  const topPlayer = myColor === 'black' ? game.white_player : game.black_player;
  const bottomPlayer = myColor === 'black' ? game.black_player : game.white_player;
  const topColor: 'white' | 'black' = myColor === 'black' ? 'white' : 'black';
  const bottomColor: 'white' | 'black' = myColor === 'black' ? 'black' : 'white';

  const boardContextValue = {
    board,
    currentPlayer,
    status,
    selectedPiece,
    legalMoves,
    lastMove,
    isThinking,
    canInteract,
    selectPiece,
    makeMove: submitMove,
    clearSelection,
  };

  return (
    <main className="min-h-screen px-2 py-4 lg:p-8" style={{ backgroundColor: theme.bgPrimary }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/lobby" className="text-sm hover:underline" style={{ color: theme.accent }}>
            &larr; Lobby
          </Link>
          {game.invite_code && game.status === 'waiting' && (
            <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: theme.bgSecondary, color: theme.textSecondary }}>
              Code: {game.invite_code}
            </span>
          )}
        </div>

        {isWaiting ? (
          <WaitingRoom inviteCode={game.invite_code} gameType={game.game_type} />
        ) : (
          <div className="space-y-3">
            {/* Opponent (top) */}
            {topPlayer && (
              <PlayerBar
                username={topPlayer.display_name || topPlayer.username}
                elo={topPlayer.elo_rating}
                isCurrentTurn={currentPlayer === topColor}
                color={topColor}
              />
            )}

            {/* Board */}
            <div className="relative mx-auto" style={{ maxWidth: 600 }}>
              <div
                className="w-full overflow-hidden"
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: 12,
                  boxShadow: `0 8px 32px ${theme.shadow}`,
                }}
              >
                <BoardProvider value={boardContextValue}>
                  <OnlineBoard flipped={myColor === 'black'} />
                </BoardProvider>
              </div>

              {/* Game over overlay */}
              {isFinished && (
                <GameOverOverlay
                  status={game.status}
                  winnerId={game.winner_id}
                  myId={user?.id || ''}
                />
              )}
            </div>

            {/* Me (bottom) */}
            {bottomPlayer && (
              <PlayerBar
                username={bottomPlayer.display_name || bottomPlayer.username}
                elo={bottomPlayer.elo_rating}
                isCurrentTurn={currentPlayer === bottomColor}
                color={bottomColor}
              />
            )}

            {/* Controls */}
            {game.status === 'playing' && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={resign}
                  className="text-xs px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
                  style={{ backgroundColor: theme.bgSecondary, color: theme.textSecondary, border: `1px solid ${theme.border}` }}
                >
                  Resign
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
