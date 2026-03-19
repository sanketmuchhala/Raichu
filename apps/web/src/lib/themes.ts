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
    selected: 'rgba(255, 255, 0, 0.4)',
    legalMove: 'rgba(0, 0, 0, 0.2)',
    captureIndicator: 'rgba(255, 0, 0, 0.4)',
    lastMove: 'rgba(255, 255, 0, 0.2)',
    bgPrimary: '#1a1b1e',
    bgSecondary: '#141517',
    bgPanel: '#25262b',
    textPrimary: '#e9ecef',
    textSecondary: '#909296',
    accent: '#51cf66',
    accentHover: '#40c057',
    border: '#2c2e33',
    shadow: 'rgba(0, 0, 0, 0.25)',
    btnSecondaryBg: '#2c2e33',
    btnSecondaryHover: '#373a40',
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
    accent: '#ff8a65',
    accentHover: '#ff7043',
    border: '#3e2e23',
    shadow: 'rgba(0, 0, 0, 0.3)',
    btnSecondaryBg: '#3e2e23',
    btnSecondaryHover: '#5d4037',
  },
};
