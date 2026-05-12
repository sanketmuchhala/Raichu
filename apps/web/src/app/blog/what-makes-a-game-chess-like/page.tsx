import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoNav, SeoFooter } from '../../../components/seo/SeoFooter';

export const metadata: Metadata = pageMetadata({
  title:       'What Makes a Game Chess-Like? | Raichu Game Blog',
  description: 'Piece hierarchy, no luck, perfect information: the qualities that make abstract strategy games feel like chess. Where Raichu fits in this family of games.',
  path:        '/blog/what-makes-a-game-chess-like',
  type:        'article',
});

const schema = {
  '@context':     'https://schema.org',
  '@type':        'Article',
  headline:       'What Makes a Game Chess-Like?',
  description:    'Defining the properties that make abstract strategy games feel like chess, with examples including Shogi, Go, Hex, Onitama, and Raichu.',
  author: { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'What Makes a Game Chess-Like?', item: `${SITE_URL}/blog/what-makes-a-game-chess-like` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;
const pStyle  = { color: 'var(--c-muted)', lineHeight: 1.75, marginBottom: '1rem' } as const;

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <SeoNav />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"     style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>
        {' / '}
        <Link href="/blog" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>
        {' / '}
        <span>What Makes a Game Chess-Like?</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.75rem' }}>
          What Makes a Game Chess-Like?
        </h1>

        <p style={{ ...pStyle, fontSize: '1.0625rem' }}>
          Not every game on a grid deserves the label. "Chess-like" has a real meaning, and understanding it helps you find games you will actually enjoy if chess is your reference point.
        </p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>The Four Core Properties</h2>
          <p style={pStyle}>
            A chess-like game typically shares four properties with chess. Not all four are required for every game in the family, but the more a game has, the more it will feel familiar to chess players.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
            {[
              {
                label: '1. Piece hierarchy',
                text: 'Different pieces move differently and have different values. Weak pieces (like chess pawns) are abundant but limited; powerful pieces are scarce but dominant. This creates material tension: every capture is a decision with consequences.',
              },
              {
                label: '2. No luck or randomness',
                text: 'No dice. No cards. No hidden information. Both players see the same board and make decisions based on pure analysis. The better decision-maker wins, consistently, not just sometimes.',
              },
              {
                label: '3. Perfect information',
                text: 'Every piece, its position, and the rules are visible to both players at all times. There is no bluffing, no hand of cards, no private information. Strategy is about calculation and anticipation, not probability.',
              },
              {
                label: '4. Tactical and positional depth',
                text: 'Simple rules generate complex situations. Patterns recur, but no two games are identical. Mastery accumulates over many games: the game rewards study and punishes carelessness.',
              },
            ].map(({ label, text }) => (
              <div key={label} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderLeft: '3px solid var(--c-green)', borderRadius: 10, padding: '1rem 1.25rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.375rem', color: 'var(--c-green)' }}>{label}</div>
                <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, margin: 0, fontSize: '0.9375rem' }}>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Examples Across the Family</h2>
          <p style={pStyle}>
            These games all qualify as chess-like in meaningful ways, though each has a distinct character:
          </p>
          <ul style={{ color: 'var(--c-muted)', lineHeight: 1.9, paddingLeft: '1.5rem' }}>
            <li><strong style={{ color: 'var(--c-text)' }}>Chess</strong>. The defining example. Six piece types, 16 per side, checkmate win condition. The benchmark.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Shogi (Japanese chess)</strong>. Piece hierarchy plus drops: captured pieces change sides and re-enter the board. More complex than chess.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Xiangqi (Chinese chess)</strong>. 9×10 board, different piece set, river boundary limits movement. Faster-paced than Western chess.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Onitama</strong>. Compact 5×5 board, movement determined by cards drawn at game start. Elegant and quick.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Go</strong>. No piece hierarchy, but perfect information, no luck, and extraordinary depth. Tactically very different but spiritually adjacent.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Raichu</strong>. Three piece types with a capture hierarchy, 8×8 board, promotion mechanic. Chess-inspired but wins by capturing all pieces, not checkmate.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>What Chess Players Transfer</h2>
          <p style={pStyle}>
            Chess players who move to other chess-like games usually find their core instincts transferable: board control, tempo, piece coordination, and tactical pattern recognition. The specific patterns are different: a Raichu fork looks different from a chess fork, but the underlying thinking process is the same.
          </p>
          <p style={pStyle}>
            The best chess-like games for chess players are those where the rule learning curve is short and the depth reveals itself quickly. Games with too many special cases feel like work; games with too few pieces feel shallow. The sweet spot is a game that surprises you in the first ten minutes and rewards continued play for months.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Where Raichu Fits</h2>
          <p style={pStyle}>
            Raichu is chess-inspired, not a chess variant. It shares chess's structural DNA: piece hierarchy, promotion, zero luck, two players, 8×8 board. It is its own complete game with different movement patterns, a capture hierarchy that restricts which pieces can take which, and a win condition of capturing all enemy pieces (not checkmate).
          </p>
          <p style={pStyle}>
            For chess players, Raichu offers a way to apply chess-honed instincts in a fresh context where opening theory does not exist yet and tactical patterns are still being discovered. Games complete in 5–15 minutes, and you can play free in the browser.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"             style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu Free</Link>
          <Link href="/chess-like-games" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Chess-Like Games Guide</Link>
          <Link href="/blog"             style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>More Articles</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
