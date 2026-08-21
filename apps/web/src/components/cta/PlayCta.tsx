'use client';

import Link from 'next/link';
import { useUIStore } from '../../store/ui-store';
import { THEMES } from '../../lib/themes';
import { analytics } from '../../lib/analytics';
import { useAuthStore } from '../../store/auth-store';

/**
 * The primary "start playing" call to action.
 *
 * Every instance reports a `cta_click` event tagged with where it was placed,
 * so `analytics_conversion` can show which placement actually turns a reader
 * into a player rather than guessing.
 */

interface PlayCtaProps {
  /** Where this button lives — becomes the `target` on the analytics event. */
  placement: string;
  label?: string;
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const SIZES = {
  sm: { padding: '0.375rem 0.8125rem', fontSize: '0.8125rem' },
  md: { padding: '0.5rem 1rem',        fontSize: '0.875rem'  },
  lg: { padding: '0.75rem 1.75rem',    fontSize: '1rem'      },
} as const;

export function PlayCta({
  placement,
  label = 'Play Free',
  href = '/play',
  size = 'md',
  fullWidth = false,
}: PlayCtaProps) {
  const theme = useUIStore((s) => THEMES[s.theme]);
  const dims = SIZES[size];

  return (
    <Link
      href={href}
      onClick={() =>
        analytics.ctaClick(
          { target: href, label: placement },
          useAuthStore.getState().user?.id ?? null,
        )
      }
      style={{
        display:        fullWidth ? 'block' : 'inline-block',
        width:          fullWidth ? '100%' : undefined,
        textAlign:      'center',
        padding:        dims.padding,
        fontSize:       dims.fontSize,
        backgroundColor: theme.accent,
        color:          '#fff',
        borderRadius:   8,
        fontWeight:     700,
        textDecoration: 'none',
        whiteSpace:     'nowrap',
        transition:     'opacity 0.12s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
    >
      {label}
    </Link>
  );
}
