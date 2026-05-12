'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUIStore } from '../../../store/ui-store';
import { THEMES } from '../../../lib/themes';
import { useAuthStore } from '../../../store/auth-store';
import { useOnlineGameStore } from '../../../store/online-game-store';
import { useGameSubscription } from '../../../lib/supabase/use-game-subscription';
import { Navbar } from '../../../components/nav/Navbar';
import { BoardProvider } from '../../../components/board/BoardContext';
import { OnlineBoard } from '../../../components/board/OnlineBoard';
import { OnlineGameSidebar } from '../../../components/game/OnlineGameSidebar';
import { WaitingRoom } from '../../../components/game/WaitingRoom';
import { GameOverOverlay } from '../../../components/game/GameOverOverlay';
import { PlayerBar } from '../../../components/game/PlayerBar';
import { createInitialBoard, decodeBoard } from '@raichu/game-engine';
import { BLACK_PIECES, WHITE_PIECES } from '@raichu/shared-types';
import type { PieceChar } from '@raichu/shared-types';

export default function OnlineGamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const theme = useUIStore((s) => THEMES[s.theme]);
  const user = useAuthStore((s) => s.user);

  const game            = useOnlineGameStore((s) => s.game);
  const board           = useOnlineGameStore((s) => s.board);
  const currentPlayer   = useOnlineGameStore((s) => s.currentPlayer);
  const status          = useOnlineGameStore((s) => s.status);
  const selectedPiece   = useOnlineGameStore((s) => s.selectedPiece);
  const legalMoves      = useOnlineGameStore((s) => s.legalMoves);
  const lastMove        = useOnlineGameStore((s) => s.lastMove);
  const isThinking      = useOnlineGameStore((s) => s.isThinking);
  const myColor         = useOnlineGameStore((s) => s.myColor);
  const loading         = useOnlineGameStore((s) => s.loading);
  const error           = useOnlineGameStore((s) => s.error);
  const moves           = useOnlineGameStore((s) => s.moves);
  const loadGame        = useOnlineGameStore((s) => s.loadGame);
  const selectPiece     = useOnlineGameStore((s) => s.selectPiece);
  const submitMove      = useOnlineGameStore((s) => s.submitMove);
  const clearSelection  = useOnlineGameStore((s) => s.clearSelection);
  const resign          = useOnlineGameStore((s) => s.resign);
  const reset           = useOnlineGameStore((s) => s.reset);

  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [boardHeight, setBoardHeight] = useState(0);
  // null = live; number = replay at that step
  const [replayStep, setReplayStep] = useState<number | null>(null);

  useGameSubscription(gameId);

  useEffect(() => {
    loadGame(gameId);
    return () => reset();
  }, [gameId, loadGame, reset]);

  useEffect(() => {
    if (!game || !user) return;
    const current = useOnlineGameStore.getState().myColor;
    if (game.white_player_id === user.id && current !== 'white') {
      useOnlineGameStore.setState({ myColor: 'white' });
    } else if (game.black_player_id === user.id && current !== 'black') {
      useOnlineGameStore.setState({ myColor: 'black' });
    }
  }, [game?.white_player_id, game?.black_player_id, user]);

  useEffect(() => {
    const el = boardContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setBoardHeight(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Board states for replay: [initial, ...after each move]
  const replayBoards = useMemo(() => {
    if (moves.length === 0) return [createInitialBoard()];
    return [createInitialBoard(), ...moves.map((m) => decodeBoard(m.board_after))];
  }, [moves]);

  const canInteract = !isThinking && myColor === currentPlayer && status === 'playing' && replayStep === null;

  const boardContextValue = useMemo(() => ({
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
  }), [board, currentPlayer, status, selectedPiece, legalMoves, lastMove, isThinking, canInteract, selectPiece, submitMove, clearSelection]);

  // Captured pieces from moves list
  const whiteCaptured = useMemo(
    () => {
      const src = replayStep !== null ? moves.slice(0, replayStep) : moves;
      return src
        .filter((m) => m.captured_piece && (BLACK_PIECES as readonly string[]).includes(m.captured_piece))
        .map((m) => m.captured_piece as PieceChar);
    },
    [moves, replayStep]
  );
  const blackCaptured = useMemo(
    () => {
      const src = replayStep !== null ? moves.slice(0, replayStep) : moves;
      return src
        .filter((m) => m.captured_piece && (WHITE_PIECES as readonly string[]).includes(m.captured_piece))
        .map((m) => m.captured_piece as PieceChar);
    },
    [moves, replayStep]
  );

  // Replay board / last move overrides
  const replayBoard    = replayStep !== null ? (replayBoards[replayStep] ?? board) : undefined;
  const replayLastMove = replayStep !== null && replayStep > 0
    ? (() => {
        const m = moves[replayStep - 1];
        if (!m) return null;
        return {
          from: { row: m.from_row, col: m.from_col },
          to:   { row: m.to_row,   col: m.to_col },
          piece: m.piece as import('@raichu/shared-types').Move['piece'],
          captured: m.captured_piece
            ? { position: { row: m.captured_row!, col: m.captured_col! }, piece: m.captured_piece as import('@raichu/shared-types').Move['piece'] }
            : undefined,
          promotion: m.promotion as import('@raichu/shared-types').Move['promotion'],
        };
      })()
    : replayStep === 0 ? null : undefined;

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
        <Navbar backHref="/lobby" backLabel="Lobby" />
        <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 57px)' }}>
          <p style={{ color: theme.textSecondary }}>Loading game...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
        <Navbar backHref="/lobby" backLabel="Lobby" />
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

  const isWaiting  = game.status === 'waiting';
  const isFinished = game.status !== 'waiting' && game.status !== 'playing';

  const topColor:    'white' | 'black' = myColor === 'black' ? 'white' : 'black';
  const bottomColor: 'white' | 'black' = myColor === 'black' ? 'black' : 'white';
  const topPlayer    = myColor === 'black' ? game.white_player : game.black_player;
  const bottomPlayer = myColor === 'black' ? game.black_player : game.white_player;

  const topCaptured    = topColor    === 'white' ? whiteCaptured : blackCaptured;
  const bottomCaptured = bottomColor === 'white' ? whiteCaptured : blackCaptured;

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
      <Navbar backHref="/lobby" backLabel="Lobby" />
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
            <div className="flex flex-col lg:flex-row gap-0 lg:gap-6">
              {/* Board column */}
              <div className="flex-1 lg:max-w-[700px] mx-auto lg:mx-0 space-y-2">
                {/* Top player */}
                {topPlayer && (
                  <PlayerBar
                    username={topPlayer.display_name || topPlayer.username}
                    elo={topPlayer.elo_rating}
                    isCurrentTurn={currentPlayer === topColor && replayStep === null}
                    color={topColor}
                    capturedPieces={topCaptured}
                  />
                )}

                {/* Board */}
                <div ref={boardContainerRef} className="relative" style={{ aspectRatio: '532 / 552' }}>
                  <div
                    className="w-full h-full overflow-hidden"
                    style={{
                      borderRadius: 12,
                      boxShadow: `0 8px 32px ${theme.shadow}, 0 2px 8px ${theme.shadow}`,
                    }}
                  >
                    <BoardProvider value={boardContextValue}>
                      <OnlineBoard
                        flipped={myColor === 'black'}
                        overrideBoard={replayBoard}
                        overrideLastMove={replayLastMove}
                      />
                    </BoardProvider>
                  </div>

                  {isFinished && replayStep === null && (
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
                    isCurrentTurn={currentPlayer === bottomColor && replayStep === null}
                    color={bottomColor}
                    capturedPieces={bottomCaptured}
                  />
                )}

                {/* Mobile resign */}
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
                <OnlineGameSidebar
                  onResign={resign}
                  replayStep={replayStep ?? undefined}
                  onReplayStep={setReplayStep}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
