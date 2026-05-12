import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../lib/seo';
import { SchemaScript } from '../../components/seo/SchemaScript';
import { SeoNav, SeoFooter } from '../../components/seo/SeoFooter';

export const metadata: Metadata = pageMetadata({
  title:       'Chess Variants and Chess-Inspired Games Explained',
  description: 'What is a chess variant? What is a chess-inspired game? Learn the difference, discover popular examples, and find out where Raichu fits in.',
  path:        '/chess-variants',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Chess Variants and Chess-Inspired Games Explained',
  description:'Explains the difference between chess variants, chess-inspired games, and abstract strategy games, with examples of each.',
  author: { '@type': 'Organization', name: 'Raichu Game' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',           item: 'https://raichu.live' },
      { '@type': 'ListItem', position: 2, name: 'Chess Variants', item: 'https://raichu.live/chess-variants' },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

export default function ChessVariantsPage() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <SeoNav />

      <nav aria-label="breadcrumb" style={{ maxWidth: 860, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>
        {' / '}
        <span>Chess Variants</span>
      </nav>

      <article style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem' }}>
          Chess Variants and Chess-Inspired Games
        </h1>
        <p style={{ color: 'var(--c-muted)', marginBottom: '2.5rem', fontSize: '1.0625rem' }}>
          Not every game that looks like chess is a chess variant. Here is a clear breakdown of the terminology and what each category means in practice.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Three Categories</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {[
              {
                label: 'Chess Variant',
                desc: 'A game that explicitly modifies or extends the rules of standard chess. The starting point is chess, and the variant changes specific rules while keeping the core framework. Examples: Chess960 (randomized starting position), Crazyhouse (captured pieces can be re-entered), Antichess (forced to capture, goal is to lose all pieces), Bughouse (two boards played simultaneously).',
              },
              {
                label: 'Chess-Inspired Game',
                desc: 'An independent game that draws on chess-like concepts — piece hierarchy, board positioning, tactical combinations — but is not derived from chess. It stands alone as its own game with its own complete ruleset. Examples: Shogi, Chinese Chess (Xiangqi), Onitama, Raichu.',
              },
              {
                label: 'Abstract Strategy Game',
                desc: 'The broadest category. Any perfect-information, no-luck strategy game. Chess variants and chess-inspired games are subsets of this. But abstract strategy games include games with no chess connection at all: Go, Hex, Reversi, Connect Four, Nim.',
              },
            ].map(({ label, desc }) => (
              <div key={label} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderLeft: '3px solid var(--c-green)', borderRadius: 10, padding: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--c-green)' }}>{label}</h3>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Popular Chess Variants</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { name: 'Chess960 (Fischer Random)', desc: 'The back rank pieces are randomized at game start, eliminating memorized opening theory. The middle game and endgame play identically to standard chess.' },
              { name: 'Crazyhouse', desc: 'Captured pieces switch sides and can be dropped back onto the board on any future turn. Creates wildly different tactical patterns and very fast games.' },
              { name: 'Antichess', desc: 'Captures are mandatory. The first player to lose all their pieces wins. Standard chess strategy is completely inverted.' },
              { name: 'Atomic Chess', desc: 'Any capture causes an explosion that destroys all pieces on adjacent squares (except pawns). Kings cannot capture. Games end explosively.' },
              { name: 'Three-Check', desc: 'Standard chess with one addition: putting the opponent in check three times wins the game, regardless of material.' },
            ].map(({ name, desc }) => (
              <div key={name} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1rem 1.25rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{name}</h3>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Where Does Raichu Fit?</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.75, marginBottom: '1rem' }}>
            Raichu is a <strong style={{ color: 'var(--c-text)' }}>chess-inspired abstract strategy game</strong>, not a chess variant.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.75, marginBottom: '1rem' }}>
            It was not derived from standard chess by modifying rules. It is an independent game with its own complete ruleset that shares chess-adjacent concepts: an 8×8 board, three piece types with a movement and capture hierarchy, a promotion mechanic, and two-player alternating turns.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.75 }}>
            Key differences from chess include: no king piece, no checkmate or check, a different win condition (capture all enemy pieces), a capture hierarchy that restricts which pieces can take which, and jump-style captures rather than displacement captures.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/raichu-vs-chess"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Raichu vs Chess</Link>
          <Link href="/chess-like-games" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Chess-Like Games</Link>
          <Link href="/play"             style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Play Raichu Free</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
