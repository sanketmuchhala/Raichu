'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { Board } from '../../components/board/Board';
import { CapturedPieces } from '../../components/board/CapturedPieces';
import { Navbar } from '../../components/nav/Navbar';
import { GameInfo } from '../../components/panels/GameInfo';
import { MoveHistory } from '../../components/panels/MoveHistory';
import { Controls } from '../../components/panels/Controls';
import { NewGameDialog } from '../../components/panels/NewGameDialog';
import { GameResultModal } from '../../components/game/GameResultModal';
import { PlayerBar } from '../../components/game/PlayerBar';
import { useUIStore } from '../../store/ui-store';
import { useGameStore } from '../../store/game-store';
import { THEMES } from '../../lib/themes';
import { BLACK_PIECES, WHITE_PIECES } from '@raichu/shared-types';
import type { PieceChar } from '@raichu/shared-types';
import { BOT_NAME, DIFFICULTY_LABEL } from '../../lib/constants';
import { analytics } from '../../lib/analytics';

export default function PlayPage() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const boardFlipped = useUIStore((s) => s.boardFlipped);
  const replayMode = useUIStore((s) => s.replayMode);
  const replayStep = useUIStore((s) => s.replayStep);
  const exitReplay = useUIStore((s) => s.exitReplay);
  const enterReplay = useUIStore((s) => s.enterReplay);

  const moveHistory   = useGameStore((s) => s.moveHistory);
  const status        = useGameStore((s) => s.status);
  const currentPlayer = useGameStore((s) => s.currentPlayer);
  const isThinking    = useGameStore((s) => s.isThinking);
  const gameMode      = useGameStore((s) => s.gameMode);
  const difficulty    = useGameStore((s) => s.difficulty);
  const playerColor   = useGameStore((s) => s.playerColor);
  const drawReason    = useGameStore((s) => s.drawReason);
  const newGame       = useGameStore((s) => s.newGame);

  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [boardHeight, setBoardHeight] = useState<number>(0);
  const [resultDismissed, setResultDismissed] = useState(false);

  // /play defaults to a bot game. ?mode=pvp switches to pass-and-play so the
  // home page's Local PvP card lands somewhere that matches its label.
  //
  // Read from window rather than useSearchParams: that hook opts the route out
  // of static prerendering, and /play is a priority-0.9 SEO page that should
  // stay static. This effect is client-only, so window is always available.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const { gameMode, difficulty, playerColor } = useGameStore.getState();

    if (new URLSearchParams(window.location.search).get('mode') === 'pvp') {
      newGame({ mode: 'pvp', difficulty, playerColor });
      return;
    }

    // The default game comes from the store's initial state, which never runs
    // newGame — so without this the opening game emits no analytics at all.
    analytics.gameStarted({ mode: gameMode, difficulty, playerColor });
  }, [newGame]);

  // Reset dismissed flag whenever a new game starts
  useEffect(() => {
    if (status === 'playing' && moveHistory.length === 0) {
      setResultDismissed(false);
    }
  }, [status, moveHistory.length]);

  useEffect(() => {
    const el = boardContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setBoardHeight(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (status === 'playing' && moveHistory.length === 0 && replayMode) exitReplay();
  }, [status, moveHistory.length, replayMode, exitReplay]);

  const relevantMoves = useMemo(
    () => replayMode ? moveHistory.slice(0, replayStep) : moveHistory,
    [moveHistory, replayMode, replayStep]
  );

  const whiteCaptured = useMemo(
    () => relevantMoves
      .filter((m) => m.captured && (BLACK_PIECES as readonly string[]).includes(m.captured.piece))
      .map((m) => m.captured!.piece as PieceChar),
    [relevantMoves]
  );

  const blackCaptured = useMemo(
    () => relevantMoves
      .filter((m) => m.captured && (WHITE_PIECES as readonly string[]).includes(m.captured.piece))
      .map((m) => m.captured!.piece as PieceChar),
    [relevantMoves]
  );

  const topCaptured    = boardFlipped ? blackCaptured : whiteCaptured;
  const bottomCaptured = boardFlipped ? whiteCaptured : blackCaptured;
  const topColor = boardFlipped ? 'black' : 'white';
  const bottomColor = boardFlipped ? 'white' : 'black';

  const isOver = status !== 'playing';

  // Who's who for the result modal
  const whiteName = gameMode === 'bot'
    ? (playerColor === 'white' ? 'You' : BOT_NAME)
    : 'White';
  const blackName = gameMode === 'bot'
    ? (playerColor === 'black' ? 'You' : `${BOT_NAME} · ${DIFFICULTY_LABEL[difficulty]}`)
    : 'Black';

  const nameForColor = (color: 'white' | 'black') => {
    if (gameMode === 'pvp') return color === 'white' ? 'White' : 'Black';
    return color === playerColor ? 'You' : BOT_NAME;
  };

  const detailForColor = (color: 'white' | 'black') => {
    if (gameMode === 'pvp') return 'Local player';
    return color === playerColor ? color[0].toUpperCase() + color.slice(1) : DIFFICULTY_LABEL[difficulty];
  };

  const handleNewGame = () => {
    setResultDismissed(true);
    newGame({ mode: gameMode, difficulty, playerColor });
  };

  const handleReplay = () => {
    setResultDismissed(true);
    enterReplay(moveHistory.length);
  };

  return (
    <>
      <Navbar gameMode />
      <main
        className="game-page flex flex-col items-center px-0 pb-4 lg:p-8"
        style={{ backgroundColor: theme.bgPrimary, minHeight: 'calc(100dvh - 52px)' }}
      >
        <div className="game-shell w-full" style={{ maxWidth: 1100 }}>
          <div className="game-layout flex flex-col lg:flex-row lg:gap-6">
            {/* Board column */}
            <div className="game-board-column w-full lg:flex-1 mx-auto lg:mx-0" style={{ maxWidth: 700 }}>
              <div className="game-player game-player-top lg:hidden">
                <PlayerBar
                  username={nameForColor(topColor)}
                  detail={detailForColor(topColor)}
                  isCurrentTurn={currentPlayer === topColor && status === 'playing'}
                  color={topColor}
                  capturedPieces={topCaptured}
                  compact
                  statusLabel={isThinking && topColor !== playerColor ? 'Thinking' : 'Turn'}
                />
              </div>

              <div className="hidden lg:block" style={{ minHeight: 26 }}>
                <CapturedPieces pieces={topCaptured} size={20} />
              </div>

              <div ref={boardContainerRef} className="game-board w-full" style={{ aspectRatio: '532 / 552' }}>
                <div
                  className="game-board-frame w-full h-full overflow-hidden"
                  style={{ borderRadius: 12, boxShadow: `0 8px 32px ${theme.shadow}, 0 2px 8px ${theme.shadow}` }}
                >
                  <Board />
                </div>
              </div>

              <div className="hidden lg:block" style={{ minHeight: 26 }}>
                <CapturedPieces pieces={bottomCaptured} size={20} />
              </div>

              <div className="game-player game-player-bottom lg:hidden">
                <PlayerBar
                  username={nameForColor(bottomColor)}
                  detail={detailForColor(bottomColor)}
                  isCurrentTurn={currentPlayer === bottomColor && status === 'playing'}
                  color={bottomColor}
                  capturedPieces={bottomCaptured}
                  compact
                  statusLabel={isThinking && bottomColor !== playerColor ? 'Thinking' : 'Turn'}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div
              className="game-sidebar w-full lg:w-80 flex flex-col lg:gap-3 sidebar-responsive"
              style={{ height: boardHeight > 0 ? boardHeight + 52 : 'auto', minHeight: 400 }}
            >
              <div className="hidden lg:block">
                <GameInfo />
              </div>
              <Controls />
              <MoveHistory />
            </div>
          </div>
        </div>

        <NewGameDialog />
      </main>

      {/* Game result modal */}
      {isOver && !resultDismissed && !replayMode && (
        <GameResultModal
          status={status as 'white_wins' | 'black_wins' | 'abandoned' | 'draw'}
          drawReason={drawReason}
          myColor={gameMode === 'bot' ? playerColor : null}
          whiteName={whiteName}
          blackName={blackName}
          moveCount={moveHistory.length}
          onNewGame={handleNewGame}
          onReplay={moveHistory.length > 0 ? handleReplay : undefined}
          onClose={() => setResultDismissed(true)}
        />
      )}
    </>
  );
}
