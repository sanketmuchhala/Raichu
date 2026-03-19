'use client';

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

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.bgPrimary }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: theme.bgSecondary, borderColor: theme.border }}
      >
        <Link href="/" className="text-lg font-bold" style={{ color: theme.textPrimary }}>
          Raichu
        </Link>
      </header>

      {/* Main content — responsive layout */}
      <div className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Board section */}
        <div className="flex-shrink-0 w-full lg:w-auto flex justify-center">
          <div className="w-full max-w-[600px] lg:max-w-none lg:w-[560px] xl:w-[600px]">
            <Board />
          </div>
        </div>

        {/* Side panel */}
        <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-3">
          <GameInfo />
          <MoveHistory />
          <Controls />
        </div>
      </div>

      {/* Dialogs */}
      <NewGameDialog />
    </main>
  );
}
