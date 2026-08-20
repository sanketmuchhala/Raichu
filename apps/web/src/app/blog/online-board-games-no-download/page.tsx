import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Online Board Games With No Download | Play Instantly',
  description: 'Board games that run in any browser with no download, no install, and no account required. Raichu, Lichess, Board Game Arena, and more.',
  path:        '/blog/online-board-games-no-download',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Online Board Games With No Download',
  description:'Browser-based board games that work without installing anything.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Online Board Games No Download', item: `${SITE_URL}/blog/online-board-games-no-download` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

const GAMES = [
  { name: 'Raichu', url: 'raichu.live', account: 'None for vs AI', note: 'Play against the AI instantly. Create an account to play online against others and track your ELO rating.' },
  { name: 'Lichess', url: 'lichess.org', account: 'None', note: 'Fully featured chess with no account required for casual play. One of the best-designed free game sites on the internet.' },
  { name: 'Board Game Arena', url: 'boardgamearena.com', account: 'Required (free)', note: 'Over 500 digital board games. Free tier is substantial. Hive, Onitama, Reversi, and many more.' },
  { name: 'Pychess', url: 'pychess.org', account: 'None', note: 'Chess variants: Shogi, Xiangqi, Crazyhouse, and more. Good alternative to Lichess for variant players.' },
  { name: '247 Chess', url: '247chess.com', account: 'None', note: 'Simple chess vs AI. No frills, works on any device, useful for quick practice.' },
];

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"    style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>{' / '}
        <Link href="/blog" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>{' / '}
        <span>Online Board Games No Download</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Online Board Games That Need No Download
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          The best board game sites work entirely in a browser. No app store, no installation, no storage space consumed. Open the URL, play. Here are the ones worth knowing.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>The Sites</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {GAMES.map(({ name, url, account, note }) => (
              <div key={name} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--c-text)', margin: 0 }}>{name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)', fontFamily: 'monospace' }}>{url}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)', backgroundColor: 'var(--c-bg-2)', padding: '0.15rem 0.5rem', borderRadius: 4 }}>Account: {account}</span>
                </div>
                <p style={{ color: 'var(--c-muted)', lineHeight: 1.65, fontSize: '0.9375rem', margin: 0 }}>{note}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>What to Look for in a Browser Game Site</h2>
          <ul style={{ color: 'var(--c-muted)', lineHeight: 1.9, paddingLeft: '1.5rem' }}>
            <li><strong style={{ color: 'var(--c-text)' }}>No account required to start.</strong> The barrier to entry should be zero. Open and play.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Works on mobile.</strong> A good site uses responsive design and touch controls.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>AI opponent available.</strong> Lets you practice without needing another person online at the same time.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>No ads blocking gameplay.</strong> Some free game sites are so cluttered with ads they become unplayable. The sites above are clean.</li>
          </ul>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu Now</Link>
          <Link href="/lobby" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Online Lobby</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
