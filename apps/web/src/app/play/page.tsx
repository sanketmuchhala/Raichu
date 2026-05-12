'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { Board } from '../../components/board/Board';
import { CapturedPieces } from '../../components/board/CapturedPieces';
import { Navbar } from '../../components/nav/Navbar';
import { GameInfo } from '../../components/panels/GameInfo';
import { MoveHistory } from '../../components/panels/MoveHistory';
import { Controls } from '../../components/panels/Controls';
import { NewGameDialog } from '../../components/panels/NewGameDialog';
import { useUIStore } from '../../store/ui-store';
import { useGameStore } from '../../store/game-store';
import { THEMES } from '../../lib/themes';
import { BLACK_PIECES, WHITE_PIECES } from '@raichu/shared-types';
import type { PieceChar } from '@raichu/shared-types';

export default function PlayPage() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const boardFlipped = useUIStore((s) => s.boardFlipped);
  const replayMode = useUIStore((s) => s.replayMode);
  const replayStep = useUIStore((s) => s.replayStep);
  const exitReplay = useUIStore((s) => s.exitReplay);

  const moveHistory = useGameStore((s) => s.moveHistory);
  const status = useGameStore((s) => s.status);

  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [boardHeight, setBoardHeight] = useState<number>(0);

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

  // Exit replay when a new game starts
  useEffect(() => {
    if (status === 'playing' && moveHistory.length === 0 && replayMode) {
      exitReplay();
    }
  }, [status, moveHistory.length, replayMode, exitReplay]);

  // Compute captured pieces (scoped to replayStep when in replay mode)
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

  // With boardFlipped (white at bottom): opponent (black) is at top, player (white) at bottom
  const topCaptured   = boardFlipped ? blackCaptured : whiteCaptured;
  const bottomCaptured = boardFlipped ? whiteCaptured : blackCaptured;

  return (
    <>
      <Navbar />
      <main
        className="flex flex-col items-center px-2 pt-4 pb-4 lg:p-8"
        style={{ backgroundColor: theme.bgPrimary, minHeight: 'calc(100vh - 52px)' }}
      >
        <div className="w-full" style={{ maxWidth: 1100 }}>
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-6">
            {/* Board column */}
            <div className="w-full lg:flex-1 mx-auto lg:mx-0 space-y-1" style={{ maxWidth: 700 }}>
              {/* Captured pieces — opponent's side (top) */}
              <div style={{ minHeight: 26 }}>
                <CapturedPieces pieces={topCaptured} size={20} />
              </div>

              <div
                ref={boardContainerRef}
                className="w-full"
                style={{ aspectRatio: '1 / 1' }}
              >
                <div
                  className="w-full h-full overflow-hidden"
                  style={{
                    borderRadius: 12,
                    boxShadow: `0 8px 32px ${theme.shadow}, 0 2px 8px ${theme.shadow}`,
                  }}
                >
                  <Board />
                </div>
              </div>

              {/* Captured pieces — your side (bottom) */}
              <div style={{ minHeight: 26 }}>
                <CapturedPieces pieces={bottomCaptured} size={20} />
              </div>
            </div>

            {/* Sidebar */}
            <div
              className="w-full lg:w-80 flex flex-col gap-0 lg:gap-3 sidebar-responsive"
              style={{ height: boardHeight > 0 ? boardHeight + 52 : 'auto', minHeight: 400 }}
            >
              <GameInfo />
              <Controls />
              <MoveHistory />
            </div>
          </div>
        </div>

        <NewGameDialog />
      </main>
    </>
  );
}
