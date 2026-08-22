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
  accentHover: string;
  border: string;
  shadow: string;
  btnSecondaryBg: string;
  btnSecondaryHover: string;
}

export const THEMES: Record<ThemeName, Theme> = {
  classic: {
    name: 'classic',
    label: 'Classic',
    boardLight: '#F0D9B5',
    boardDark: '#B58863',
    selected: 'rgba(255, 215, 0, 0.4)',
    legalMove: 'rgba(0, 0, 0, 0.2)',
    captureIndicator: 'rgba(220, 50, 50, 0.45)',
    lastMove: 'rgba(255, 215, 0, 0.2)',
    bgPrimary: '#1a1a1a',
    bgSecondary: '#111111',
    bgPanel: '#242424',
    textPrimary: '#f0ece8',
    textSecondary: '#9a9a9a',
    accent: '#769656',
    accentHover: '#638048',
    border: '#333333',
    shadow: 'rgba(0, 0, 0, 0.4)',
    btnSecondaryBg: '#2e2e2e',
    btnSecondaryHover: '#383838',
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
    bgPrimary: '#0f172a',
    bgSecondary: '#0b1120',
    bgPanel: '#1e293b',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    border: '#334155',
    shadow: 'rgba(0, 0, 0, 0.3)',
    btnSecondaryBg: '#334155',
    btnSecondaryHover: '#475569',
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
    bgPrimary: '#1c1410',
    bgSecondary: '#14100c',
    bgPanel: '#2a1f18',
    textPrimary: '#efebe9',
    textSecondary: '#a1887f',
    accent: '#e07040',
    accentHover: '#c05a30',
    border: '#3e2e23',
    shadow: 'rgba(0, 0, 0, 0.3)',
    btnSecondaryBg: '#3e2e23',
    btnSecondaryHover: '#5d4037',
  },
};
