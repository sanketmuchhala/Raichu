import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'How Piece Hierarchies Work in Strategy Games',
  description: 'Piece hierarchies in Chess, Raichu, and Shogi: why capture rules create tactics, how material imbalances decide games, and what makes a good hierarchy design.',
  path:        '/blog/piece-hierarchy-in-board-games',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'How Piece Hierarchies Work in Strategy Games',
  description:'An explanation of piece hierarchies in Chess, Raichu, and other strategy games.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  datePublished: '2026-05-12',
  dateModified:  '2026-05-12',
  image:         `${SITE_URL}/opengraph-image`,
  mainEntityOfPage: `${SITE_URL}/blog/piece-hierarchy-in-board-games`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Piece Hierarchies', item: `${SITE_URL}/blog/piece-hierarchy-in-board-games` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100dvh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"    style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>{' / '}
        <Link href="/blog" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>{' / '}
        <span>Piece Hierarchies in Board Games</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          How Piece Hierarchies Work in Strategy Games
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          One of the fundamental design patterns in strategy games is the piece hierarchy: a ranking of pieces by power, where more powerful pieces can capture less powerful ones. This single design decision creates the tactical depth that makes games like Chess and Raichu interesting.
        </p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Chess: Relative Values</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Chess uses a soft hierarchy based on piece mobility. The standard relative values: pawn (1), knight and bishop (3 each), rook (5), queen (9). These are not rules in the game, they are practical assessments of how many squares each piece can reach.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            In Chess, any piece can capture any other piece. A pawn can take a queen if the queen steps onto the pawn's diagonal. The hierarchy is emergent from mobility, not enforced by rules. This creates the possibility of sacrifices: giving up a higher-value piece for a positional advantage.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Raichu: Enforced Capture Restrictions</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Raichu uses a different approach: capture restrictions built into the rules. Pichu can only capture Pichu. Pikachu can capture Pichu and Pikachu. Raichu can capture everything. A Pichu cannot take a Pikachu no matter where either piece stands.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            This hard hierarchy creates clear strategic implications. A player with more Raichupromoted pieces has a structural advantage that lesser pieces cannot overcome. Two Pikachus cannot threaten one Raichu. This means the promotion race is decisive in a way that chess material counts are not.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            The enforced restriction also simplifies calculation: you never have to ask whether your Pichu is safe from a Pikachu. The rules answer that definitively.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Shogi: Captured Pieces Change Sides</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Shogi has fourteen piece types with a promotion system that changes piece movement. The critical difference from Chess and Raichu: when you capture an opponent's piece, it joins your hand and can be re-entered onto the board anywhere.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            This means material is never lost from the game, only transferred. Trading pieces is not about depletion but about position. The hierarchy still exists, but the dynamics of the endgame are entirely different because both players always have pieces available.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Why Hierarchy Creates Tactics</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Without a hierarchy, every piece threatens every other piece equally. Strategy becomes purely about board coverage. With a hierarchy, tactics emerge around forks (threatening two pieces simultaneously), skewers (forcing a valuable piece to move and exposing a less valuable one behind it), and pins (a piece cannot move without exposing something more valuable).
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            These patterns exist because pieces have different values. The moment a game introduces value differentiation, the entire space of tactical combinations opens up.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"                  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu</Link>
          <Link href="/blog/raichu-piece-guide" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Raichu Piece Guide</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
