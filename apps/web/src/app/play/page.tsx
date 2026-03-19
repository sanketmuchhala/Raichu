'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Board } from '../../components/board/Board';
import { GameInfo } from '../../components/panels/GameInfo';
import { MoveHistory } from '../../components/panels/MoveHistory';
import { Controls } from '../../components/panels/Controls';
import { NewGameDialog } from '../../components/panels/NewGameDialog';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';

export default function PlayPage() {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [boardHeight, setBoardHeight] = useState<number>(0);

  useEffect(() => {
    const el = boardContainerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBoardHeight(entry.contentRect.width); // aspect-ratio 1/1, so height = width
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 lg:p-8"
      style={{ backgroundColor: theme.bgPrimary }}
    >
      <div className="w-full" style={{ maxWidth: 1100 }}>
        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
            style={{ color: theme.textPrimary, textDecoration: 'none' }}
          >
            ⚡ Raichu
          </Link>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
            backgroundColor: theme.accent + '20',
            color: theme.accent,
          }}>
            Strategy Board Game
          </span>
        </div>

        {/* Two-column grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Board — perfect square */}
          <div
            ref={boardContainerRef}
            className="w-full lg:flex-1"
            style={{ aspectRatio: '1 / 1', maxWidth: 700 }}
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

          {/* Sidebar — matches board height */}
          <div
            className="w-full lg:w-80 flex flex-col gap-3"
            style={{
              height: boardHeight > 0 ? boardHeight : 'auto',
              minHeight: 400,
            }}
          >
            <GameInfo />
            <Controls />
            <MoveHistory />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <NewGameDialog />
    </main>
  );
}
