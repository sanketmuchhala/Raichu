'use client';

import { useRef, useEffect, useState } from 'react';
import { Board } from '../../components/board/Board';
import { Navbar } from '../../components/nav/Navbar';
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
        setBoardHeight(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <main
        className="flex flex-col items-center px-2 pt-4 pb-4 lg:p-8"
        style={{ backgroundColor: theme.bgPrimary, minHeight: 'calc(100vh - 52px)' }}
      >
        <div className="w-full" style={{ maxWidth: 1100 }}>
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-6">
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

            <div
              className="w-full lg:w-80 flex flex-col gap-0 lg:gap-3 sidebar-responsive"
              style={{ height: boardHeight > 0 ? boardHeight : 'auto', minHeight: 400 }}
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
