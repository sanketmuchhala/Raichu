import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Top 10 Strategy Games Like Chess | Best Chess Alternatives',
  description: 'The best strategy games like chess: Chess960, Shogi, Go, Hex, Hive, Onitama, Arimaa, Xiangqi, Checkers, and Raichu. All zero-luck, all deep.',
  path:        '/blog/games-like-chess',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Top 10 Strategy Games Like Chess',
  description:'A ranked list of the best strategy games like chess for players who want something new without giving up tactical depth.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  datePublished: '2026-05-12',
  dateModified:  '2026-05-12',
  image:         `${SITE_URL}/opengraph-image`,
  mainEntityOfPage: `${SITE_URL}/blog/games-like-chess`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Top 10 Strategy Games Like Chess', item: `${SITE_URL}/blog/games-like-chess` },
    ],
  },
};

const GAMES = [
  {
    rank: 1,
    name: 'Chess960 (Fischer Random)',
    why:  'If you love chess but want to escape opening memorization, Chess960 is the natural first step. The back rank is randomized at game start, forcing real over-the-board thinking from move one. All other rules are identical to standard chess.',
    note: 'Available on Chess.com and Lichess.',
  },
  {
    rank: 2,
    name: 'Shogi',
    why:  'Japan\'s national board game. Fourteen piece types and one rule change from chess that transforms everything: captured pieces switch sides and can be re-entered on any open square. The result is tactical density and endgame complexity that exceeds chess.',
    note: 'Harder learning curve than chess but enormously rewarding.',
  },
  {
    rank: 3,
    name: 'Go',
    why:  'Territorially the opposite of chess: you build influence with stones, not pieces. The underlying skills transfer. Perfect information, zero luck, and a game tree so large that AI couldn\'t crack it until 2016. Played on a 19×19 grid.',
    note: 'Simple rules, deepest game on this list.',
  },
  {
    rank: 4,
    name: 'Hex',
    why:  'Connect your two opposite sides of the board before your opponent connects theirs. No pieces, no captures, just territory. A famous mathematical result proves Hex can never draw. Two players, alternating, placing stones on a diamond grid.',
    note: 'Quick to learn. Strategically subtle.',
  },
  {
    rank: 5,
    name: 'Hive',
    why:  'No board required: the tiles form the playing area. Twelve insect types each move uniquely. The goal is to surround the opponent\'s Queen Bee. Hive is portable, has zero setup time, and rewards the same instincts as chess: piece coordination and tactical vision.',
    note: 'Excellent for travel. Strong app versions available.',
  },
  {
    rank: 6,
    name: 'Onitama',
    why:  'A 5×5 chess-like game where movement rules change with every turn based on cards drawn at game start. Every game plays differently. Fast, tense, and deeply tactical despite fitting in 15 minutes.',
    note: 'Best chess-like game for players who want quick sessions.',
  },
  {
    rank: 7,
    name: 'Arimaa',
    why:  'Designed specifically to be hard for computers. Arimaa uses a chess board with animal pieces that push and pull each other. The branching factor is enormous. Human champions dominated computer programs for years after chess had been solved.',
    note: 'For players who find chess too "solvable" by engines.',
  },
  {
    rank: 8,
    name: 'Xiangqi (Chinese Chess)',
    why:  'More widely played globally than Western chess. A river divides the 9×10 board, limiting piece movement and creating a different strategic character. Faster games, more tactical, less positional than chess.',
    note: 'Enormous community in East Asia; growing globally.',
  },
  {
    rank: 9,
    name: 'Checkers (Draughts)',
    why:  'The simplest game on this list. Jump captures, diagonal movement, and promotion are the only mechanics. International draughts (10×10) has genuine depth. Great for understanding capture-based tactics before moving to more complex games.',
    note: 'Solved computationally but still fun at human level.',
  },
  {
    rank: 10,
    name: 'Raichu',
    why:  'A modern chess-inspired abstract game with three piece types and a capture hierarchy. Pichus can only take Pichus. Pikachus can take Pichus and Pikachus. Raichus can take anything. Promotion creates game-defining moments. Games last 5–15 minutes, no draws, no luck. Free in your browser.',
    note: 'Best option for a quick chess-like game without installing anything.',
    cta: true,
  },
];

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100dvh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"     style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>
        {' / '}
        <Link href="/blog" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>
        {' / '}
        <span>Top 10 Strategy Games Like Chess</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Top 10 Strategy Games Like Chess
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          If you love chess but want something fresh, this list is for you. Every game here shares chess&apos;s core appeal: no luck, pure skill, deep tactics. Each has a distinct identity and mechanics. Ordered roughly by familiarity to chess players.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>The List</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {GAMES.map(({ rank, name, why, note, cta }) => (
              <div key={rank} style={{ display: 'flex', gap: '1rem', backgroundColor: 'var(--c-bg-1)', border: `1px solid ${cta ? 'var(--c-green)' : 'var(--c-border)'}`, borderRadius: 10, padding: '1.25rem' }}>
                <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', backgroundColor: cta ? 'var(--c-green)' : 'var(--c-bg-2)', color: cta ? '#fff' : 'var(--c-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', marginTop: 2 }}>
                  {rank}
                </span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.375rem', color: cta ? 'var(--c-green)' : 'var(--c-text)' }}>{name}</h3>
                  <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '0.375rem', fontSize: '0.9375rem' }}>{why}</p>
                  <p style={{ color: 'var(--c-muted)', fontSize: '0.8125rem', fontStyle: 'italic' }}>{note}</p>
                  {cta && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                      <Link href="/play"  style={{ display: 'inline-block', padding: '0.5rem 1.25rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 6, fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem' }}>Play Free</Link>
                      <Link href="/rules" style={{ display: 'inline-block', padding: '0.5rem 1.25rem', backgroundColor: 'var(--c-bg-2)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 6, fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>Rules</Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>How to Choose</h2>
          <ul style={{ color: 'var(--c-muted)', lineHeight: 1.9, paddingLeft: '1.5rem' }}>
            <li><strong style={{ color: 'var(--c-text)' }}>Want chess with one twist?</strong> Try Chess960.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Want maximum depth?</strong> Commit to Shogi or Go.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Want something quick and browser-playable?</strong> Raichu. free, no install, games in 5–15 minutes.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Want portable, physical play?</strong> Hive or Onitama.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Want to learn abstract strategy from scratch?</strong> Checkers, then build up.</li>
          </ul>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"             style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu Now</Link>
          <Link href="/raichu-vs-chess"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Raichu vs Chess</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
