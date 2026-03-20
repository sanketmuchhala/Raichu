'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUIStore } from '../../../store/ui-store';
import { THEMES } from '../../../lib/themes';
import { useAuthStore } from '../../../store/auth-store';
import { useOnlineGameStore } from '../../../store/online-game-store';
import { useGameSubscription } from '../../../lib/supabase/use-game-subscription';
import { NavHeader } from '../../../components/nav/NavHeader';
import { BoardProvider } from '../../../components/board/BoardContext';
import { OnlineBoard } from '../../../components/board/OnlineBoard';
import { OnlineGameSidebar } from '../../../components/game/OnlineGameSidebar';
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

  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [boardHeight, setBoardHeight] = useState(0);

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

  // Track board height for sidebar sizing
  useEffect(() => {
    const el = boardContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBoardHeight(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
        <NavHeader backHref="/lobby" backLabel="Lobby" />
        <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 57px)' }}>
          <p style={{ color: theme.textSecondary }}>Loading game...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
        <NavHeader backHref="/lobby" backLabel="Lobby" />
        <main className="flex flex-col items-center justify-center gap-4" style={{ minHeight: 'calc(100vh - 57px)' }}>
          <p style={{ color: '#ef4444' }}>{error}</p>
          <Link href="/lobby" className="text-sm hover:underline" style={{ color: theme.accent }}>
            Back to Lobby
          </Link>
        </main>
      </div>
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
    <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
      <NavHeader backHref="/lobby" backLabel="Lobby" />
      <main className="px-2 py-4 lg:p-8">
        {isWaiting ? (
          <div className="max-w-lg mx-auto">
            {game.invite_code && (
              <div className="mb-4 flex justify-center">
                <span className="text-xs font-mono px-3 py-1 rounded-md" style={{ backgroundColor: theme.bgSecondary, color: theme.textSecondary }}>
                  Invite Code: {game.invite_code}
                </span>
              </div>
            )}
            <WaitingRoom inviteCode={game.invite_code} gameType={game.game_type} />
          </div>
        ) : (
          <div className="w-full mx-auto" style={{ maxWidth: 1100 }}>
            {/* Two-column layout: board + sidebar */}
            <div className="flex flex-col lg:flex-row gap-0 lg:gap-6">
              {/* Board column */}
              <div className="flex-1 lg:max-w-[700px] mx-auto lg:mx-0 space-y-2">
                {/* Top player */}
                {topPlayer && (
                  <PlayerBar
                    username={topPlayer.display_name || topPlayer.username}
                    elo={topPlayer.elo_rating}
                    isCurrentTurn={currentPlayer === topColor}
                    color={topColor}
                  />
                )}

                {/* Board */}
                <div ref={boardContainerRef} className="relative" style={{ aspectRatio: '1 / 1' }}>
                  <div
                    className="w-full h-full overflow-hidden"
                    style={{
                      borderRadius: 12,
                      boxShadow: `0 8px 32px ${theme.shadow}, 0 2px 8px ${theme.shadow}`,
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

                {/* Bottom player */}
                {bottomPlayer && (
                  <PlayerBar
                    username={bottomPlayer.display_name || bottomPlayer.username}
                    elo={bottomPlayer.elo_rating}
                    isCurrentTurn={currentPlayer === bottomColor}
                    color={bottomColor}
                  />
                )}

                {/* Mobile resign button (hidden on desktop where sidebar has it) */}
                {game.status === 'playing' && (
                  <div className="flex justify-center pt-2 lg:hidden">
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

              {/* Sidebar — desktop only */}
              <div
                className="hidden lg:block w-80 sidebar-responsive"
                style={{
                  height: boardHeight > 0 ? boardHeight + 100 : 'auto',
                  minHeight: 400,
                }}
              >
                <OnlineGameSidebar onResign={resign} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
