'use client';

import { create } from 'zustand';
import type { ThemeName } from '../lib/themes';

interface UIStore {
  theme: ThemeName;
  isDragging: boolean;
  dragPiece: {
    piece: string;
    fromRow: number;
    fromCol: number;
  } | null;
  boardFlipped: boolean;
  showNewGameDialog: boolean;
  mobileHistoryOpen: boolean;
  // Replay mode for offline game
  replayMode: boolean;
  replayStep: number;

  setTheme: (theme: ThemeName) => void;
  startDrag: (piece: string, fromRow: number, fromCol: number) => void;
  endDrag: () => void;
  flipBoard: () => void;
  setShowNewGameDialog: (show: boolean) => void;
  toggleMobileHistory: () => void;
  enterReplay: (step: number) => void;
  exitReplay: () => void;
  setReplayStep: (step: number) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  theme: 'classic',
  isDragging: false,
  dragPiece: null,
  boardFlipped: true,
  showNewGameDialog: false,
  mobileHistoryOpen: false,
  replayMode: false,
  replayStep: 0,

  setTheme: (theme) => set({ theme }),

  startDrag: (piece, fromRow, fromCol) =>
    set({ isDragging: true, dragPiece: { piece, fromRow, fromCol } }),

  endDrag: () =>
    set({ isDragging: false, dragPiece: null }),

  flipBoard: () =>
    set((state) => ({ boardFlipped: !state.boardFlipped })),

  setShowNewGameDialog: (show) =>
    set({ showNewGameDialog: show }),

  toggleMobileHistory: () =>
    set((state) => ({ mobileHistoryOpen: !state.mobileHistoryOpen })),

  enterReplay: (step) => set({ replayMode: true, replayStep: step }),
  exitReplay: () => set({ replayMode: false, replayStep: 0 }),
  setReplayStep: (step) => set({ replayStep: step }),
}));
