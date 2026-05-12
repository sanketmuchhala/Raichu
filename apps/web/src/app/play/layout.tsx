import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../lib/seo';
import { SchemaScript } from '../../components/seo/SchemaScript';

export const metadata: Metadata = pageMetadata({
  title:       'Play Raichu Online | Free Chess-Style Strategy Game in Your Browser',
  description: 'Play Raichu free in your browser, a chess-inspired abstract strategy game. Choose vs AI or challenge a friend online. No download required.',
  path:        '/play',
});

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context':           'https://schema.org',
    '@type':              'VideoGame',
    name:                 'Raichu Game',
    description:          'A chess-inspired abstract strategy game playable free in the browser.',
    genre:                'Abstract strategy game',
    gamePlatform:         'Web Browser',
    applicationCategory:  'Game',
    playMode:             ['SinglePlayer', 'MultiPlayer'],
    operatingSystem:      'Any',
    url:                  'https://raichu.live/play',
    offers: {
      '@type': 'Offer',
      price:   '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <SchemaScript schema={schema} />
      {children}
      {/* SEO: brief description below the game interface */}
      <section style={{ backgroundColor: 'var(--c-bg-1)', borderTop: '1px solid var(--c-border)', padding: '1.25rem 2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--c-muted)', fontSize: '0.8125rem', maxWidth: 640, margin: '0 auto', lineHeight: 1.65 }}>
          Raichu is a free chess-inspired abstract strategy game. No download, no account required.
          Two players, three piece types, zero luck.{' '}
          <Link href="/rules"       style={{ color: 'var(--c-green)', textDecoration: 'none' }}>Rules</Link>
          {' · '}
          <Link href="/how-to-play" style={{ color: 'var(--c-green)', textDecoration: 'none' }}>How to Play</Link>
          {' · '}
          <Link href="/strategy"    style={{ color: 'var(--c-green)', textDecoration: 'none' }}>Strategy Guide</Link>
          {' · '}
          <Link href="/faq"         style={{ color: 'var(--c-green)', textDecoration: 'none' }}>FAQ</Link>
        </p>
      </section>
    </>
  );
}
