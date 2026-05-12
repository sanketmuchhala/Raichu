import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogBoardDemo } from '../../../components/blog/BlogBoardDemo';

// Endgame: white Raichu systematically captures remaining black pieces
const ENDGAME_BOARD =
  '........' +
  '........' +
  '..b.....' +
  '........' +
  '....b...' +
  '........' +
  '......@.' +
  '........';

const ENDGAME_SEQ = [
  // Raichu jumps over (4,4) to capture it, landing at (3,5)
  { from: [6, 6] as [number,number], to: [3, 3] as [number,number], capture: [4, 4] as [number,number] },
  // Raichu moves to threaten the second Pichu
  { from: [3, 3] as [number,number], to: [3, 2] as [number,number] },
  // Raichu captures the remaining Pichu
  { from: [3, 2] as [number,number], to: [1, 2] as [number,number], capture: [2, 2] as [number,number] },
  // Reset: move Raichu back
  { from: [1, 2] as [number,number], to: [6, 6] as [number,number] },
];
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Raichu Endgame Strategy: How to Convert a Winning Position',
  description: 'How to win the endgame in Raichu. Raichu dominance, promotion racing, eliminating opponent pieces, and converting material advantages into forced wins.',
  path:        '/blog/raichu-endgame-strategy',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Raichu Endgame Strategy',
  description:'How to convert winning positions in the Raichu endgame.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',     item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',     item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Raichu Endgame Strategy', item: `${SITE_URL}/blog/raichu-endgame-strategy` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"        style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>{' / '}
        <Link href="/blog"    style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>{' / '}
        <span>Raichu Endgame Strategy</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Raichu Endgame Strategy: Converting Winning Positions
        </h1>
        <div style={{ margin: '0 0 2rem', display: 'flex', justifyContent: 'center' }}>
          <BlogBoardDemo
            initialBoard={ENDGAME_BOARD}
            sequence={ENDGAME_SEQ}
            caption="White Raichu hunts down the remaining black pieces — one by one"
            squareSize={46}
            intervalMs={1600}
          />
        </div>

        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Having a material advantage in Raichu does not automatically win the game. Knowing how to convert that advantage into a forced win requires specific endgame understanding. Here is what matters.
        </p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Raichu Piece Dominance</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            If you have a Raichu and your opponent does not, your Raichu can capture anything freely. Pikachus and Pichus cannot threaten it. The endgame strategy is simple: use your Raichu to systematically remove opponent pieces.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Move your Raichu to squares where it threatens multiple opponent pieces simultaneously. An opponent forced to defend against two threats at once can only block one. The piece they cannot defend gets captured.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>When Both Players Have a Raichu</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            With Raichupromoted pieces on both sides, the game becomes about supporting your Raichu while threatening the opponent's. A Raichu supported by a Pikachu is more dangerous than an unsupported Raichu: even if the opponent captures your Raichu, the Pikachu captures back.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            The player who can threaten an undefended Raichu exchange while maintaining a material edge wins. Trade Raichupromoted pieces only if the resulting position favors you in the remaining pieces.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>The Promotion Race</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            If you have a Pichu or Pikachu closer to the far rank than any opponent blocker, it will promote. Count the moves: how many moves does your piece need to reach promotion? How many moves does the nearest opponent piece need to block it?
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            If your piece arrives in fewer moves than any blocker can, the promotion is unstoppable. Force the opponent to react to multiple promotion threats simultaneously. They can block one. The other promotes to Raichu.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Eliminating the Last Pieces</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            A player with no legal moves loses. In the endgame, you win not just by capturing all pieces but by cutting off the last remaining pieces until they have no legal moves.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            A trapped Pichu on the edge of the board with no diagonal forward moves available has no legal moves. If all opponent pieces are similarly blocked or captured, the game ends. Use your Raichu to create blockades while your Pikachus cut off retreat.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem', backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.75rem', color: 'var(--c-text)' }}>The simplest endgame principle</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, margin: 0 }}>
            Activate every piece. An inactive Pichu in the corner does nothing while you try to win with one Raichu. Coordination between your pieces, with your Raichu leading and your Pikachus supporting, converts material advantage into forced wins faster than any single piece acting alone.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"      style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Practice Endgames</Link>
          <Link href="/strategy"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Full Strategy Guide</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
