import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Best Free Browser Strategy Games You Can Play Now',
  description: 'The best free abstract strategy games playable in a browser. Lichess, PlayStrategy, Raichu, and more. No download, no install. Pure skill competition.',
  path:        '/blog/best-free-browser-strategy-games',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Best Free Browser Strategy Games You Can Play Now',
  description:'A curated list of the best free abstract strategy games playable in a web browser, with no download or installation required.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Best Free Browser Strategy Games', item: `${SITE_URL}/blog/best-free-browser-strategy-games` },
    ],
  },
};

const GAMES = [
  {
    name:     'Raichu Game',
    url:      'https://raichu.live/play',
    internal: '/play',
    type:     'Chess-inspired abstract strategy',
    free:     'Yes. No account needed for AI play',
    desc:     'A chess-inspired abstract strategy game with three piece types and a capture hierarchy. Play vs AI at three difficulty levels or create a free account to challenge other players online. Games last 5–15 minutes. Zero luck, no draws.',
    highlight: true,
  },
  {
    name: 'Lichess',
    url:  'https://lichess.org',
    type: 'Chess and chess variants',
    free: 'Yes. fully open source, always free',
    desc: 'The gold standard for free online chess. Lichess offers standard chess, Chess960, Crazyhouse, King of the Hill, Three-Check, and more. No ads, no premium paywall. Arguably the best-designed chess site available.',
  },
  {
    name: 'PlayStrategy',
    url:  'https://playstrategy.org',
    type: 'Multi-game abstract strategy platform',
    free: 'Yes',
    desc: 'Two-player strategy games in a browser: Chess, Draughts, Go, Backgammon, Lines of Action, Mancala, and more. A Lichess-style interface for a broad range of abstract games. Good for players who want to explore beyond chess.',
  },
  {
    name: 'PlayAbstractGames',
    url:  'https://playabstractgames.com',
    type: 'Abstract strategy collection',
    free: 'Yes',
    desc: 'A collection of classic and modern abstract strategy games against AI. Includes Hex, Y, Breakthrough, Havannah, and others. Excellent for players who specifically want no-luck, perfect-information games.',
  },
  {
    name: 'Chess.com',
    url:  'https://chess.com',
    type: 'Chess and chess variants',
    free: 'Free tier available',
    desc: 'The most popular chess site in the world. Extensive learning tools, puzzles, and a large community. Variants like Crazyhouse, Bughouse, Chess960, and 4-Player Chess are available. Some features require a subscription.',
  },
];

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"     style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>
        {' / '}
        <Link href="/blog" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>
        {' / '}
        <span>Best Free Browser Strategy Games</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Best Free Browser Strategy Games You Can Play Now
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          All of these run in your browser. No installation, no download. Most require no account. All are zero-luck strategy games.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>The Games</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {GAMES.map(({ name, url, internal, type, free, desc, highlight }) => (
              <div key={name} style={{ backgroundColor: 'var(--c-bg-1)', border: `1px solid ${highlight ? 'var(--c-green)' : 'var(--c-border)'}`, borderLeft: `3px solid ${highlight ? 'var(--c-green)' : 'var(--c-border)'}`, borderRadius: 10, padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', margin: 0, color: highlight ? 'var(--c-green)' : 'var(--c-text)' }}>{name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)', fontStyle: 'italic' }}>{type}</span>
                </div>
                <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '0.5rem', fontSize: '0.9375rem' }}>{desc}</p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
                    <strong style={{ color: 'var(--c-text)' }}>Free:</strong> {free}
                  </span>
                  {internal ? (
                    <Link href={internal} style={{ fontSize: '0.8125rem', color: 'var(--c-green)', textDecoration: 'none', fontWeight: 600 }}>Play →</Link>
                  ) : (
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8125rem', color: 'var(--c-green)', textDecoration: 'none', fontWeight: 600 }}>Visit →</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Which Should You Start With?</h2>
          <ul style={{ color: 'var(--c-muted)', lineHeight: 1.9, paddingLeft: '1.5rem' }}>
            <li><strong style={{ color: 'var(--c-text)' }}>Already know chess?</strong> Lichess for more chess, Raichu for a new challenge.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>New to abstract strategy?</strong> Raichu. the rules fit on one page and the game rewards your first few hours immediately.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Want variety?</strong> PlayStrategy has the broadest game selection.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Want pure no-luck games beyond chess?</strong> PlayAbstractGames.</li>
          </ul>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu Free</Link>
          <Link href="/blog" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>More Articles</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
