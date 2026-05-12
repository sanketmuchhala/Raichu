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
      className="min-h-screen flex flex-col items-center justify-center px-2 pt-2 pb-1 lg:p-8"
      style={{ backgroundColor: theme.bgPrimary }}
    >
      <div className="w-full" style={{ maxWidth: 1100 }}>
        {/* Title — hidden on mobile for more board space */}
        <div className="hidden lg:flex items-center gap-3 mb-4">
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-sans, system-ui)',
              fontSize: '1.375rem',
              fontWeight: 700,
              color: theme.textPrimary,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            Raichu
          </Link>
          <Link
            href="/rules"
            className="text-xs ml-auto hover:underline"
            style={{ color: theme.textSecondary }}
          >
            Rules
          </Link>
        </div>

        {/* Two-column grid */}
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-6">
          {/* Board — hero centered on mobile */}
          <div
            ref={boardContainerRef}
            className="w-full lg:flex-1 mx-auto lg:mx-0"
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

          {/* Sidebar — compact bottom bar on mobile, full panel on desktop */}
          <div
            className="w-full lg:w-80 flex flex-col gap-0 lg:gap-3 sidebar-responsive"
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
