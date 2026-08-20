'use client';

import { useEffect } from 'react';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';

/**
 * Writes the active theme onto the document root as CSS custom properties.
 *
 * Two token systems existed side by side: the `Theme` objects in lib/themes.ts,
 * read through Zustand by the app pages, and a `--c-*` set hardcoded in
 * globals.css with the Classic values. The blog and marketing pages read the
 * CSS variables, so they stayed dark-Classic no matter which theme the user
 * picked — a visible bug, not just duplication.
 *
 * This makes the Zustand store the single source and lets both worlds read it.
 */
export function ThemeVars() {
  const themeName = useUIStore((s) => s.theme);

  useEffect(() => {
    const theme = THEMES[themeName];
    const root = document.documentElement;

    const vars: Record<string, string> = {
      '--c-bg': theme.bgPrimary,
      '--c-bg-1': theme.bgSecondary,
      '--c-bg-2': theme.bgPanel,
      '--c-border': theme.border,
      '--c-text': theme.textPrimary,
      '--c-muted': theme.textSecondary,
      '--c-green': theme.accent,
      '--c-green-h': theme.accentHover,
      // Board colours, so anything outside the SVG can match it.
      '--c-board-light': theme.boardLight,
      '--c-board-dark': theme.boardDark,
    };

    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }

    // Keep the browser UI (address bar, form controls) in step with the theme.
    root.style.colorScheme = 'dark';
  }, [themeName]);

  return null;
}
