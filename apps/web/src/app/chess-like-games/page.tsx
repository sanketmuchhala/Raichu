import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../lib/seo';
import { SchemaScript } from '../../components/seo/SchemaScript';
import { SeoFooter } from '../../components/seo/SeoFooter';
import { Navbar } from '../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Best Chess-Like Games to Play Online | Chess-Inspired Strategy Games',
  description: 'Discover the best chess-like games: Chess, Shogi, Go, Hex, Hive, Onitama, Arimaa, and Raichu. Each offers tactical depth and strategic thinking without luck.',
  path:        '/chess-like-games',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Best Chess-Like Games to Play Online',
  description:'A guide to the best chess-like abstract strategy games including Chess, Shogi, Go, Hex, Hive, Onitama, Arimaa, and Raichu.',
  author: { '@type': 'Organization', name: 'Raichu Game' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',             item: 'https://raichu.live' },
      { '@type': 'ListItem', position: 2, name: 'Chess-Like Games', item: 'https://raichu.live/chess-like-games' },
    ],
  },
};

const games = [
  {
    name: 'Chess',
    tag: 'The classic',
    desc: 'The definitive two-player strategy game. Chess features six piece types, 16 pieces per side, and a win condition of checkmating the king. Its deep theory, rich history, and global community make it the benchmark all strategy games are measured against. If you can handle its learning curve, the depth is unmatched.',
    chessLike: 'Piece hierarchy, tactical combinations, positional play, and promotion.',
  },
  {
    name: 'Shogi',
    tag: 'Japanese chess',
    desc: 'Japan\'s national board game. Like chess but with one key difference: captured pieces change sides and can be re-entered onto the board. This creates massive combinatorial depth and very different endgames. Shogi has 8 piece types, a 9×9 board, and is significantly more complex than chess.',
    chessLike: 'Piece hierarchy, promotion zones, deep tactical combinations.',
  },
  {
    name: 'Go',
    tag: 'The oldest strategy game',
    desc: 'Played on a 19×19 grid with black and white stones, Go is about territory: surrounding and capturing areas of the board. The rules are extremely simple (one of the simplest rule sets in abstract strategy), but the resulting depth dwarfs chess. Go has the largest game tree of any two-player board game.',
    chessLike: 'Perfect information, no luck, deep strategy. Very different mechanically but rewards the same analytical mindset.',
  },
  {
    name: 'Hex',
    tag: 'Connect the sides',
    desc: 'Played on a diamond-shaped board, Hex is about connecting your two opposite sides before your opponent connects theirs. Two players, alternating, placing stones. No captures. A famous result proves Hex can never end in a draw. Elegant, mathematically rich, and very different from chess.',
    chessLike: 'Perfect information, no luck, strategic planning. Minimal rules with deep emergent strategy.',
  },
  {
    name: 'Hive',
    tag: 'No board needed',
    desc: 'A two-player abstract game played with hexagonal tiles, each representing an insect with a unique movement pattern. There is no board: the tiles form the playing surface. The goal is to surround the opponent\'s Queen Bee. Hive is portable, zero-luck, and surprisingly deep for how quickly it can be learned.',
    chessLike: 'Piece types with distinct movement rules, tactical captures, strategic positioning.',
  },
  {
    name: 'Onitama',
    tag: 'Card-based movement',
    desc: 'A two-player abstract game where movement rules change each turn based on cards drawn at game start. Each player holds two movement cards; using one passes it to the opponent. The result is a compact, quick game with high replayability and tactical depth. Every game plays differently.',
    chessLike: 'Capture-based, piece movement hierarchy, positional play on a 5×5 board.',
  },
  {
    name: 'Arimaa',
    tag: 'Designed to beat computers',
    desc: 'Created specifically to be difficult for AI to solve (at the time). Arimaa uses a chess-like board with animals of different strengths that push and pull each other. The branching factor is extremely high, and positional evaluation is complex even for modern engines.',
    chessLike: 'Animal piece hierarchy, positional strategy, capturing via displacement.',
  },
  {
    name: 'Raichu',
    tag: 'Play free in your browser',
    desc: 'Raichu is a chess-inspired abstract strategy game with three piece types: Pichu, Pikachu, and Raichu, each with distinct movement and a capture hierarchy. Played on an 8×8 board, the goal is to capture every opponent piece. No luck, no draws, no download required.',
    chessLike: 'Piece hierarchy, promotion mechanic, board control, positional and tactical depth.',
    cta: true,
  },
];

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

export default function ChessLikeGamesPage() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 860, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>
        {' / '}
        <span>Chess-Like Games</span>
      </nav>

      <article style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem' }}>
          Best Chess-Like Games to Play Online
        </h1>
        <p style={{ color: 'var(--c-muted)', marginBottom: '2.5rem', fontSize: '1.0625rem' }}>
          If you enjoy chess, these abstract strategy games share its DNA: no luck, perfect information, piece-based tactics, and strategic depth. Each one rewards study and punishes carelessness.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>What Makes a Game Chess-Like?</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.75 }}>
            A chess-like game typically features: two players taking turns on a grid, distinct piece types with different movement rules, no luck or randomness, and strategic depth that scales with experience. They reward the same analytical habits: pattern recognition, long-term planning, tactical calculation. Skills that chess players develop.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>The Games</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {games.map(({ name, tag, desc, chessLike, cta }) => (
              <div key={name} style={{ backgroundColor: 'var(--c-bg-1)', border: `1px solid ${cta ? 'var(--c-green)' : 'var(--c-border)'}`, borderLeft: `3px solid ${cta ? 'var(--c-green)' : 'var(--c-border)'}`, borderRadius: 10, padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>{name}</h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--c-green)', fontWeight: 600 }}>{tag}</span>
                </div>
                <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '0.625rem', fontSize: '0.9375rem' }}>{desc}</p>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.875rem' }}>
                  <strong style={{ color: 'var(--c-text)' }}>Chess-like because: </strong>{chessLike}
                </p>
                {cta && (
                  <div style={{ marginTop: '0.875rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Link href="/play"  style={{ display: 'inline-block', padding: '0.5rem 1.25rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 6, fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem' }}>Play Raichu Free</Link>
                    <Link href="/rules" style={{ display: 'inline-block', padding: '0.5rem 1.25rem', backgroundColor: 'var(--c-bg-2)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 6, fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>Learn the Rules</Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/raichu-vs-chess"         style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Raichu vs Chess</Link>
          <Link href="/abstract-strategy-games" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Abstract Strategy Games</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
