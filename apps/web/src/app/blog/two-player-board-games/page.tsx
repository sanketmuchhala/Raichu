import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Best Two Player Board Games for Adults | Top 2 Player Games',
  description: 'The best two player board games for adults: Chess, Go, Raichu, Hive, Onitama, 7 Wonders Duel, Lost Cities, and more. Ranked by depth and replayability.',
  path:        '/blog/two-player-board-games',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Best Two Player Board Games for Adults',
  description:'A ranked list of the best two player board games, from pure strategy to light card games.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  datePublished: '2026-05-12',
  dateModified:  '2026-05-12',
  image:         `${SITE_URL}/opengraph-image`,
  mainEntityOfPage: `${SITE_URL}/blog/two-player-board-games`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Best Two Player Board Games', item: `${SITE_URL}/blog/two-player-board-games` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

const GAMES = [
  { name: 'Chess', time: '10-60 min', depth: 'Very High', note: 'The gold standard. Deep tactics, rich theory, and a global community. Best when both players are close in strength.' },
  { name: 'Go', time: '20-120 min', depth: 'Extreme', note: 'Nineteen-by-nineteen grid, 181 black stones and 180 white. Territorial, meditative, and harder to crack than chess.' },
  { name: 'Raichu', time: '5-15 min', depth: 'Medium-High', note: 'Three piece types. A capture hierarchy. Promotion moments. Chess-like feel in under 15 minutes with zero luck. Free in browser.' },
  { name: 'Hive', time: '20-30 min', depth: 'Medium', note: 'No board required. Hexagonal tiles form the play area. Twelve insect types each move differently. Portable and surprisingly deep.' },
  { name: 'Onitama', time: '15-20 min', depth: 'Medium', note: 'Five-by-five board. Movement rules rotate between players via cards. Every game starts different. Fast, tense, replayable.' },
  { name: '7 Wonders Duel', time: '30-45 min', depth: 'Medium', note: 'Card drafting for two. Science vs military vs culture victory paths. The best two-player adaptation of a multiplayer classic.' },
  { name: 'Lost Cities', time: '20-30 min', depth: 'Light-Medium', note: 'Card game. Five color-coded expeditions. Risk management and card reading. Good for non-gamers entering strategy.' },
  { name: 'Codenames Duet', time: '15-30 min', depth: 'Light', note: 'Cooperative word association. Works well when you want something conversational rather than competitive.' },
];

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"    style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>{' / '}
        <Link href="/blog" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>{' / '}
        <span>Best Two Player Board Games</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Best Two Player Board Games for Adults
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Two-player games are a different category from group games. The dynamic is direct, personal, and unforgiving. Every decision is a conversation between two minds. This list covers the best options across different time budgets and depth levels.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>The List</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {GAMES.map(({ name, time, depth, note }, i) => (
              <div key={name} style={{ display: 'flex', gap: '1rem', backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1.25rem' }}>
                <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--c-bg-2)', color: 'var(--c-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', marginTop: 2 }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--c-text)' }}>{name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)', backgroundColor: 'var(--c-bg-2)', padding: '0.15rem 0.5rem', borderRadius: 4 }}>{time}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)', backgroundColor: 'var(--c-bg-2)', padding: '0.15rem 0.5rem', borderRadius: 4 }}>Depth: {depth}</span>
                  </div>
                  <p style={{ color: 'var(--c-muted)', lineHeight: 1.65, fontSize: '0.9375rem', margin: 0 }}>{note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>How to Choose</h2>
          <ul style={{ color: 'var(--c-muted)', lineHeight: 1.9, paddingLeft: '1.5rem' }}>
            <li><strong style={{ color: 'var(--c-text)' }}>5-15 minutes:</strong> Raichu or Onitama. Both play fast, both reward skill.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>30-60 minutes:</strong> Chess, Hive, or 7 Wonders Duel depending on how tactical you want to get.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Maximum depth:</strong> Go. No other game comes close in longevity of skill growth.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Online, free, right now:</strong> Raichu (this site) or Lichess for chess.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Physical gift:</strong> Hive Pocket. Fits in a jacket pocket, plays anywhere.</li>
          </ul>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu Free</Link>
          <Link href="/rules" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Learn the Rules</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
