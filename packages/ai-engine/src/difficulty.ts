import type { Difficulty } from '@raichu/shared-types';

export interface DifficultyConfig {
  maxDepth: number;
  timeBudgetMs: number;
  label: string;
}

export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    maxDepth: 6,
    timeBudgetMs: 400,
    label: 'Easy',
  },
  medium: {
    maxDepth: 8,
    timeBudgetMs: 800,
    label: 'Medium',
  },
  hard: {
    maxDepth: 12,
    timeBudgetMs: 1500,
    label: 'Hard',
  },
};
