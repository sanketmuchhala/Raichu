import type { Difficulty } from '@raichu/shared-types';

export interface DifficultyConfig {
  maxDepth: number;
  timeBudgetMs: number;
  label: string;
}

export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    maxDepth: 2,
    timeBudgetMs: 1000,
    label: 'Easy',
  },
  medium: {
    maxDepth: 4,
    timeBudgetMs: 3000,
    label: 'Medium',
  },
  hard: {
    maxDepth: 8,
    timeBudgetMs: 5000,
    label: 'Hard',
  },
};
