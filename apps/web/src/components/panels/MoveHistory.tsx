'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/game-store';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { formatMoveHuman } from '@raichu/game-engine';

export function MoveHistory() {
  const moveHistory  = useGameStore((s) => s.moveHistory);
  const theme        = useUIStore((s) => THEMES[s.theme]);
  const mobileHistoryOpen   = useUIStore((s) => s.mobileHistoryOpen);
  const toggleMobileHistory = useUIStore((s) => s.toggleMobileHistory);
  const replayMode   = useUIStore((s) => s.replayMode);
  const replayStep   = useUIStore((s) => s.replayStep);
  const enterReplay  = useUIStore((s) => s.enterReplay);
  const exitReplay   = useUIStore((s) => s.exitReplay);
  const setReplayStep = useUIStore((s) => s.setReplayStep);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest move when not in replay mode
  useEffect(() => {
    if (!replayMode && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory.length, replayMode]);

  // Scroll active move into view during replay
  useEffect(() => {
    if (replayMode && activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [replayStep, replayMode]);

  const total = moveHistory.length;

  const goFirst = () => {
    if (replayMode) setReplayStep(0);
    else enterReplay(0);
  };
  const goPrev = () => {
    const cur = replayMode ? replayStep : total;
    if (cur > 0) enterReplay(cur - 1);
  };
  const goNext = () => {
    const cur = replayMode ? replayStep : total;
    if (cur < total) enterReplay(cur + 1);
  };
  const goLast = () => {
    if (replayMode) { setReplayStep(total); if (total === 0) exitReplay(); }
    else enterReplay(total);
  };

  const handleMoveClick = (idx: number) => {
    enterReplay(idx + 1);
  };

  return (
    <div
      className="game-moves panel-card mobile-compact flex flex-col lg:flex-1 lg:min-h-0"
      style={{
        backgroundColor: theme.bgPanel,
        borderColor: theme.border,
        boxShadow: `0 2px 8px ${theme.shadow}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 lg:px-4 py-2.5 lg:py-3"
        style={{ borderBottom: `1px solid ${theme.border}` }}
      >
        <button
          className="flex items-center gap-2 lg:cursor-default"
          onClick={toggleMobileHistory}
          aria-expanded={mobileHistoryOpen}
          aria-controls="game-move-list"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
            Moves
          </span>
          <span className="text-xs lg:hidden" style={{ color: theme.textSecondary }}>
            {total}
          </span>
          {!mobileHistoryOpen && total > 0 && (
            <span className="move-history-preview lg:hidden" style={{ color: theme.textSecondary }}>
              Last: {formatMoveHuman(moveHistory[total - 1])}
            </span>
          )}
          <svg
            className="lg:hidden"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              transform: mobileHistoryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 300ms ease',
            }}
            aria-hidden="true"
          >
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke={theme.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Replay controls */}
        {total > 0 && <div className="flex items-center gap-1">
          {replayMode && (
            <button
              className="move-live-button text-xs px-2 rounded-md font-medium mr-1"
              style={{ backgroundColor: theme.accent + '22', color: theme.accent, border: `1px solid ${theme.accent}44` }}
              onClick={exitReplay}
            >
              Live
            </button>
          )}
          <button
            className="move-nav-button rounded flex items-center justify-center transition-colors"
            style={{ backgroundColor: theme.btnSecondaryBg, color: theme.textSecondary }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryBg)}
            onClick={goFirst}
            disabled={total === 0}
            title="First position"
            aria-label="Go to starting position"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3.2 2.5v9M11 3.2L5.5 7l5.5 3.8V3.2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className="move-nav-button rounded flex items-center justify-center transition-colors"
            style={{ backgroundColor: theme.btnSecondaryBg, color: theme.textSecondary }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryBg)}
            onClick={goPrev}
            disabled={total === 0 || (replayMode && replayStep === 0)}
            title="Previous move"
            aria-label="Go to previous move"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9.5 2.8L4.2 7l5.3 4.2V2.8z" fill="currentColor" />
            </svg>
          </button>
          <button
            className="move-nav-button rounded flex items-center justify-center transition-colors"
            style={{ backgroundColor: theme.btnSecondaryBg, color: theme.textSecondary }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryBg)}
            onClick={goNext}
            disabled={total === 0 || (replayMode && replayStep === total)}
            title="Next move"
            aria-label="Go to next move"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M4.5 2.8L9.8 7l-5.3 4.2V2.8z" fill="currentColor" />
            </svg>
          </button>
          <button
            className="move-nav-button rounded flex items-center justify-center transition-colors"
            style={{ backgroundColor: theme.btnSecondaryBg, color: theme.textSecondary }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.btnSecondaryBg)}
            onClick={goLast}
            disabled={total === 0 || (replayMode && replayStep === total)}
            title="Latest position"
            aria-label="Go to latest position"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M10.8 2.5v9M3 3.2L8.5 7 3 10.8V3.2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>}
      </div>

      {/* Move list */}
      <div
        id="game-move-list"
        ref={scrollRef}
        className={[
          'custom-scroll px-2 py-1.5',
          'lg:overflow-y-auto lg:flex-1',
          mobileHistoryOpen
            ? 'max-h-[300px] overflow-y-auto'
            : 'max-h-0 overflow-hidden lg:max-h-none',
        ].join(' ')}
        style={{ transition: 'max-height 300ms ease-in-out' }}
      >
        {moveHistory.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: theme.textSecondary }}>
            No moves yet
          </p>
        ) : (
          <div className="space-y-px">
            {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
              const whiteIdx = i * 2;
              const blackIdx = i * 2 + 1;
              const whiteMove = moveHistory[whiteIdx];
              const blackMove = moveHistory[blackIdx];
              const whiteActive = replayMode && replayStep === whiteIdx + 1;
              const blackActive = replayMode && blackMove && replayStep === blackIdx + 1;
              const isRowActive = whiteActive || blackActive;

              return (
                <div
                  key={i}
                  ref={isRowActive ? activeRef : undefined}
                  className="flex text-sm font-mono rounded-md px-2 py-1"
                  style={{
                    color: theme.textPrimary,
                    backgroundColor: isRowActive
                      ? theme.accent + '1a'
                      : i % 2 === 0 ? 'transparent' : theme.bgSecondary + '60',
                  }}
                >
                  <span className="w-8 shrink-0 font-medium" style={{ color: theme.textSecondary }}>
                    {i + 1}.
                  </span>
                  <button
                    className="flex-1 truncate px-1 text-left"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: whiteActive ? theme.accent : theme.textPrimary,
                      fontWeight: whiteActive ? 700 : 400,
                      borderRadius: 3,
                      backgroundColor: whiteActive ? theme.accent + '22' : 'transparent',
                    }}
                    onClick={() => handleMoveClick(whiteIdx)}
                    aria-label={`Review move ${whiteIdx + 1}: ${formatMoveHuman(whiteMove)}`}
                  >
                    {formatMoveHuman(whiteMove)}
                  </button>
                  {blackMove && (
                    <button
                      className="flex-1 truncate px-1 text-left"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: blackActive ? theme.accent : theme.textPrimary,
                        fontWeight: blackActive ? 700 : 400,
                        borderRadius: 3,
                        backgroundColor: blackActive ? theme.accent + '22' : 'transparent',
                      }}
                      onClick={() => handleMoveClick(blackIdx)}
                      aria-label={`Review move ${blackIdx + 1}: ${formatMoveHuman(blackMove)}`}
                    >
                      {formatMoveHuman(blackMove)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Replay step indicator */}
      {replayMode && (
        <div
          className="px-3 py-1.5 text-xs flex items-center justify-between"
          style={{ borderTop: `1px solid ${theme.border}`, color: theme.textSecondary }}
        >
          <span style={{ color: theme.accent }}>Reviewing</span>
          <span>{replayStep} / {total}</span>
        </div>
      )}
    </div>
  );
}
