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
    x: number;
    y: number;
  } | null;
  boardFlipped: boolean;
  showNewGameDialog: boolean;

  setTheme: (theme: ThemeName) => void;
  startDrag: (piece: string, fromRow: number, fromCol: number, x: number, y: number) => void;
  updateDrag: (x: number, y: number) => void;
  endDrag: () => void;
  flipBoard: () => void;
  setShowNewGameDialog: (show: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  theme: 'classic',
  isDragging: false,
  dragPiece: null,
  boardFlipped: false,
  showNewGameDialog: false,

  setTheme: (theme) => set({ theme }),

  startDrag: (piece, fromRow, fromCol, x, y) =>
    set({ isDragging: true, dragPiece: { piece, fromRow, fromCol, x, y } }),

  updateDrag: (x, y) =>
    set((state) => ({
      dragPiece: state.dragPiece ? { ...state.dragPiece, x, y } : null,
    })),

  endDrag: () =>
    set({ isDragging: false, dragPiece: null }),

  flipBoard: () =>
    set((state) => ({ boardFlipped: !state.boardFlipped })),

  setShowNewGameDialog: (show) =>
    set({ showNewGameDialog: show }),
}));
