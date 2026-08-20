import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';
import { BlogBoardDemo } from '../../../components/blog/BlogBoardDemo';

// ─── Demo board data ──────────────────────────────────────────────────────

// Pichu advancing diagonally then promoting at row 7
const PICHU_BOARD =
  '........' +
  '........' +
  '...w....' +
  '........' +
  '........' +
  '........' +
  '........' +
  '........';

const PICHU_SEQ = [
  { from: [2, 3] as [number,number], to: [3, 4] as [number,number] },
  { from: [3, 4] as [number,number], to: [4, 3] as [number,number] },
  { from: [4, 3] as [number,number], to: [5, 4] as [number,number] },
  { from: [5, 4] as [number,number], to: [6, 3] as [number,number] },
  { from: [6, 3] as [number,number], to: [7, 4] as [number,number], promotion: '@' },
];

// Pikachu moving forward and sideways
const PIKA_BOARD =
  '........' +
  '........' +
  '........' +
  '........' +
  '...W....' +
  '........' +
  '........' +
  '........';

const PIKA_SEQ = [
  { from: [4, 3] as [number,number], to: [3, 3] as [number,number] },
  { from: [3, 3] as [number,number], to: [3, 5] as [number,number] },
  { from: [3, 5] as [number,number], to: [2, 5] as [number,number] },
  { from: [2, 5] as [number,number], to: [2, 3] as [number,number] },
  { from: [2, 3] as [number,number], to: [4, 3] as [number,number] },
];

// Raichu jumping over a black Pichu to capture it
const RAICHU_BOARD =
  '........' +
  '........' +
  '........' +
  '....b...' +
  '........' +
  '......@.' +
  '........' +
  '........';

const RAICHU_SEQ = [
  { from: [5, 6] as [number,number], to: [2, 3] as [number,number], capture: [3, 4] as [number,number] },
  { from: [2, 3] as [number,number], to: [5, 6] as [number,number] },
];

export const metadata: Metadata = pageMetadata({
  title:       'Raichu Piece Guide: How Pichu, Pikachu, and Raichu Work',
  description: 'Complete guide to every piece in Raichu: movement rules, capture power, promotion, and strategic role. Learn how Pichu, Pikachu, and Raichu interact.',
  path:        '/blog/raichu-piece-guide',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Raichu Piece Guide: Pichu, Pikachu, and Raichu',
  description:'Complete movement and capture rules for every piece in the Raichu board game.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  datePublished: '2026-05-12',
  dateModified:  '2026-05-12',
  image:         `${SITE_URL}/opengraph-image`,
  mainEntityOfPage: `${SITE_URL}/blog/raichu-piece-guide`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Raichu Piece Guide', item: `${SITE_URL}/blog/raichu-piece-guide` },
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
        <span>Raichu Piece Guide</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Raichu Piece Guide: Pichu, Pikachu, and Raichu
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Raichu has three piece types. The rules are simple enough to learn in five minutes, but the interactions between pieces create real tactical depth. Here is everything you need to know about each piece.
        </p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Pichu: The Foot Soldier</h2>
          <div style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>MOVEMENT</p>
                <p style={{ color: 'var(--c-text)', lineHeight: 1.6, margin: 0 }}>One step diagonally forward only. Cannot move backward.</p>
              </div>
              <div>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>CAPTURES</p>
                <p style={{ color: 'var(--c-text)', lineHeight: 1.6, margin: 0 }}>Pichu only. Cannot capture Pikachu or Raichu.</p>
              </div>
            </div>
            <p style={{ color: 'var(--c-muted)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>PROMOTION</p>
            <p style={{ color: 'var(--c-text)', lineHeight: 1.6, margin: 0 }}>Reaches the far edge of the board and promotes to Raichu.</p>
          </div>
          <div style={{ margin: '1.25rem 0', display: 'flex', justifyContent: 'center' }}>
            <BlogBoardDemo
              initialBoard={PICHU_BOARD}
              sequence={PICHU_SEQ}
              caption="Pichu advances diagonally and promotes to Raichu on the far rank"
              squareSize={48}
              intervalMs={1200}
            />
          </div>

          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Pichu is the most limited piece but creates the most tension. A Pichu that reaches the far rank promotes to Raichu, the most powerful piece on the board. This promotion threat forces your opponent to respond. A passed Pichu with a clear path to promotion is a serious threat.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Because Pichu can only capture other Pichus, strong Pikachus and Raichupromoted pieces ignore them entirely. This creates a specific dynamic: Pichus fight their own battles while the larger pieces contest different areas.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Pikachu: The Mid-Range Fighter</h2>
          <div style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>MOVEMENT</p>
                <p style={{ color: 'var(--c-text)', lineHeight: 1.6, margin: 0 }}>One step forward, left, or right. No diagonal. No backward.</p>
              </div>
              <div>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>CAPTURES</p>
                <p style={{ color: 'var(--c-text)', lineHeight: 1.6, margin: 0 }}>Pichu and Pikachu. Cannot capture Raichu.</p>
              </div>
            </div>
            <p style={{ color: 'var(--c-muted)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>PROMOTION</p>
            <p style={{ color: 'var(--c-text)', lineHeight: 1.6, margin: 0 }}>Reaches the far edge and promotes to Raichu.</p>
          </div>
          <div style={{ margin: '1.25rem 0', display: 'flex', justifyContent: 'center' }}>
            <BlogBoardDemo
              initialBoard={PIKA_BOARD}
              sequence={PIKA_SEQ}
              caption="Pikachu moves forward and sideways but never diagonally or backward"
              squareSize={48}
              intervalMs={1100}
            />
          </div>

          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Pikachu is the workhorse piece. It can take most things, move in three directions, and promote if it gets through. The restriction to no diagonals and no backward movement means positioning matters: a Pikachu on the wrong side of the board has limited options.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            The Raichu immunity is strategically important. Two Pikachus cannot threaten a Raichu at all. Only another Raichu can remove a Raichu from the board. This means a player with a Raichu advantage holds a material edge that Pikachus cannot overcome alone.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Raichu: The Dominant Piece</h2>
          <div style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>MOVEMENT</p>
                <p style={{ color: 'var(--c-text)', lineHeight: 1.6, margin: 0 }}>Any direction, any distance. Queen-like movement.</p>
              </div>
              <div>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>CAPTURES</p>
                <p style={{ color: 'var(--c-text)', lineHeight: 1.6, margin: 0 }}>Everything: Pichu, Pikachu, and Raichu.</p>
              </div>
            </div>
            <p style={{ color: 'var(--c-muted)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>CAPTURE METHOD</p>
            <p style={{ color: 'var(--c-text)', lineHeight: 1.6, margin: 0 }}>Jumps to capture. Does not slide through pieces like a chess queen.</p>
          </div>
          <div style={{ margin: '1.25rem 0', display: 'flex', justifyContent: 'center' }}>
            <BlogBoardDemo
              initialBoard={RAICHU_BOARD}
              sequence={RAICHU_SEQ}
              caption="Raichu jumps over an enemy piece to capture it, landing on the square beyond"
              squareSize={48}
              intervalMs={1800}
            />
          </div>

          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Raichu is the most powerful piece and the only piece that can capture another Raichu. The jump-capture rule is the key difference from a chess queen: a Raichu cannot simply slide into a piece and take it. It must jump to the target square, which must be reachable without obstruction between the Raichu and the target.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Protecting your Raichu is the most important positional principle in the game. Losing your only Raichu to an opponent who still has one creates an imbalance that is very difficult to overcome.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>The Hierarchy in Practice</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            The three-tier hierarchy creates tactical puzzles that feel similar to chess. A Pikachu is safe from Pichus but threatened by Raichupromoted pieces. A Pichu chain advancing toward promotion forces the opponent to respond with Pichus or create a blocker. Raichu pieces create mating threats the opponent must constantly neutralize.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            The simplest way to think about piece value: Raichu beats everything, Pikachu beats everything except Raichu, Pichu beats only Pichu. In material terms, one Raichu equals roughly three Pikachus in practice.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"     style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Now</Link>
          <Link href="/rules"    style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Full Rules</Link>
          <Link href="/strategy" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Strategy Guide</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
