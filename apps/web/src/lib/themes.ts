export type ThemeName = 'classic' | 'slate' | 'walnut';

export interface Theme {
  name: ThemeName;
  label: string;
  boardLight: string;
  boardDark: string;
  selected: string;
  legalMove: string;
  captureIndicator: string;
  lastMove: string;
  bgPrimary: string;
  bgSecondary: string;
  bgPanel: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  border: string;
}

export const THEMES: Record<ThemeName, Theme> = {
  classic: {
    name: 'classic',
    label: 'Classic',
    boardLight: '#F0D9B5',
    boardDark: '#B58863',
    selected: 'rgba(255, 255, 0, 0.4)',
    legalMove: 'rgba(0, 0, 0, 0.2)',
    captureIndicator: 'rgba(255, 0, 0, 0.4)',
    lastMove: 'rgba(255, 255, 0, 0.2)',
    bgPrimary: '#312E2B',
    bgSecondary: '#272421',
    bgPanel: '#262421',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    accent: '#81B64C',
    border: '#3d3a37',
  },
  slate: {
    name: 'slate',
    label: 'Slate',
    boardLight: '#DEE3E6',
    boardDark: '#8CA2AD',
    selected: 'rgba(100, 180, 255, 0.4)',
    legalMove: 'rgba(0, 0, 0, 0.2)',
    captureIndicator: 'rgba(239, 68, 68, 0.4)',
    lastMove: 'rgba(100, 180, 255, 0.2)',
    bgPrimary: '#1E293B',
    bgSecondary: '#0F172A',
    bgPanel: '#1E293B',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    accent: '#3B82F6',
    border: '#334155',
  },
  walnut: {
    name: 'walnut',
    label: 'Walnut',
    boardLight: '#EDE0C8',
    boardDark: '#A67B5B',
    selected: 'rgba(255, 200, 50, 0.4)',
    legalMove: 'rgba(0, 0, 0, 0.2)',
    captureIndicator: 'rgba(220, 38, 38, 0.4)',
    lastMove: 'rgba(255, 200, 50, 0.2)',
    bgPrimary: '#3E2723',
    bgSecondary: '#2C1810',
    bgPanel: '#3E2723',
    textPrimary: '#EFEBE9',
    textSecondary: '#A1887F',
    accent: '#FF8A65',
    border: '#5D4037',
  },
};
