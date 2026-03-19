import type { Difficulty } from '@raichu/shared-types';

export interface DifficultyConfig {
  maxDepth: number;
  timeBudgetMs: number;
  label: string;
}

export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    maxDepth: 10,
    timeBudgetMs: 8000,
    label: 'Easy',
  },
  medium: {
    maxDepth: 16,
    timeBudgetMs: 15000,
    label: 'Medium',
  },
  hard: {
    maxDepth: 24,
    timeBudgetMs: 30000,
    label: 'Hard',
  },
};
