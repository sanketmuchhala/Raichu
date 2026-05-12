import type { Metadata } from 'next';
import { pageMetadata } from '../../lib/seo';
import { SchemaScript } from '../../components/seo/SchemaScript';

export const metadata: Metadata = pageMetadata({
  title:       'Play Raichu Online | Free Chess-Style Strategy Game in Your Browser',
  description: 'Play Raichu free in your browser — a chess-inspired abstract strategy game. Choose vs AI or challenge a friend online. No download required.',
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
    url:                  'https://raichugame.com/play',
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
    </>
  );
}
