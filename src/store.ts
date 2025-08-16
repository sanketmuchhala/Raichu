import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  seed: number;
  setSeed: (seed: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      seed: 1,
      setSeed: (seed) => set({ seed }),
    }),
    { name: 'grim-state' }
  )
);
