import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Fast Strategy Games: Best Games Under 20 Minutes',
  description: 'The best strategy games that play in under 20 minutes: Raichu, Onitama, Hive, Blitz Chess, Othello, and more. Deep games that respect your time.',
  path:        '/blog/fast-strategy-games',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Fast Strategy Games: Best Games Under 20 Minutes',
  description:'Strategy games with real depth that play in under 20 minutes.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  datePublished: '2026-05-12',
  dateModified:  '2026-05-12',
  image:         `${SITE_URL}/opengraph-image`,
  mainEntityOfPage: `${SITE_URL}/blog/fast-strategy-games`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Fast Strategy Games', item: `${SITE_URL}/blog/fast-strategy-games` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

const GAMES = [
  { name: 'Raichu', time: '5-15 min', note: 'Three pieces, capture hierarchy, promotion. Chess-like depth in a fraction of the time. Free in browser, no account required.' },
  { name: 'Onitama', time: '15-20 min', note: 'Five pieces, rotating movement cards. Every game starts with different movement rules. Decisive and tense.' },
  { name: 'Blitz Chess (5 min)', time: '10-12 min', note: 'Standard chess with a five-minute clock per player. Faster than rapid chess, still requires genuine tactical skill.' },
  { name: 'Hive Pocket', time: '20-30 min', note: 'Physical tile game with twelve insect types. Slightly over 20 minutes but worth noting for portability and depth.' },
  { name: 'Othello (Reversi)', time: '10-20 min', note: 'Flip opponent pieces. Simple rules. Good for playing fast without learning a new system.' },
  { name: 'Lost Cities (2 player)', time: '20-30 min', note: 'Card game with risk management. Slightly over 20 minutes but plays fast once learned.' },
];

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"    style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>{' / '}
        <Link href="/blog" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>{' / '}
        <span>Fast Strategy Games</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Fast Strategy Games: Depth in Under 20 Minutes
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          A strategy game does not need to take an hour to be deep. The best fast strategy games compress decision-making into a short window, where every move carries weight precisely because there are fewer of them.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>The Games</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {GAMES.map(({ name, time, note }) => (
              <div key={name} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--c-text)', margin: 0 }}>{name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)', backgroundColor: 'var(--c-bg-2)', padding: '0.15rem 0.5rem', borderRadius: 4 }}>{time}</span>
                </div>
                <p style={{ color: 'var(--c-muted)', lineHeight: 1.65, fontSize: '0.9375rem', margin: 0 }}>{note}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Why Short Games Can Be Deep</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Game length and strategic depth are not the same thing. A Go game can last two hours with hundreds of decisions. A Raichu game lasts fifteen minutes with thirty to fifty moves. The depth in Raichu comes from the piece hierarchy and promotion tension, not from game length.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Shorter games also improve faster. Playing ten Raichu games gives you more data on your mistakes than playing one sixty-minute chess game. Faster feedback loops accelerate skill development.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu Now</Link>
          <Link href="/lobby" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Play Online</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
