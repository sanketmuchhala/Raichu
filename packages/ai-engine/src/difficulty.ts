import type { Difficulty } from '@raichu/shared-types';

export interface DifficultyConfig {
  maxDepth: number;
  timeBudgetMs: number;
  label: string;
}

export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    maxDepth: 10,
    timeBudgetMs: 1500,
    label: 'Easy',
  },
  medium: {
    maxDepth: 16,
    timeBudgetMs: 3000,
    label: 'Medium',
  },
  hard: {
    maxDepth: 24,
    timeBudgetMs: 6000,
    label: 'Hard',
  },
};
