import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogBoardDemo } from '../../../components/blog/BlogBoardDemo';

// Opening demo: white and black each advance pieces toward center
const OPENING_BOARD =
  '........' +
  '.W.W.W.W' +
  'w.w.w.w.' +
  '........' +
  '........' +
  '.b.b.b.b' +
  'B.B.B.B.' +
  '........';

const OPENING_SEQ = [
  { from: [2, 2] as [number,number], to: [3, 3] as [number,number] },
  { from: [5, 3] as [number,number], to: [4, 2] as [number,number] },
  { from: [1, 3] as [number,number], to: [3, 3] as [number,number] },
  { from: [6, 2] as [number,number], to: [4, 2] as [number,number] },
  { from: [2, 4] as [number,number], to: [3, 5] as [number,number] },
  { from: [5, 5] as [number,number], to: [4, 4] as [number,number] },
];
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Raichu Opening Strategy: First Move Principles',
  description: 'How to start strong in Raichu. Five opening principles: advance Pichus, develop Pikachus, protect your Raichu, and create promotion threats.',
  path:        '/blog/raichu-opening-strategy',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Raichu Opening Strategy: First Move Principles',
  description:'Five opening principles for Raichu that apply in every game.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  datePublished: '2026-05-12',
  dateModified:  '2026-08-20',
  image:         `${SITE_URL}/opengraph-image`,
  mainEntityOfPage: `${SITE_URL}/blog/raichu-opening-strategy`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',     item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',     item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Raichu Opening Strategy', item: `${SITE_URL}/blog/raichu-opening-strategy` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

const PRINCIPLES = [
  {
    n: 1,
    title: 'Advance your Pichus',
    body: 'Pichus only move diagonally forward. A Pichu that sits still does nothing. Start pushing Pichus toward the opponent\'s side from the first move. A Pichu that reaches the far rank becomes a Raichu. Every Pichu that stays home is a lost opportunity.',
  },
  {
    n: 2,
    title: 'Develop Pikachus into active positions',
    body: 'Pikachus move forward, left, and right. They cannot retreat. Move them forward early to contest territory. A Pikachu stuck behind your own Pichus has no moves until those Pichus clear. Plan your Pichu advances to open lines for Pikachus.',
  },
  {
    n: 3,
    title: 'Keep your Raichu safe',
    body: 'Your starting Raichu is your most valuable piece. A Raichu is the only piece that can capture another Raichu. If you lose your Raichu while your opponent keeps theirs, the game becomes very difficult. Avoid moving your Raichu into a position where it can be captured by an opponent Raichu without compensation.',
  },
  {
    n: 4,
    title: 'Contest the center',
    body: 'Pieces in the center control more squares than pieces on the edges. A Pikachu on the center file can move to three different squares. A Pikachu on the edge can only move to two. The center of the board is where influence is maximized. Try to occupy or threaten center squares before your opponent does.',
  },
  {
    n: 5,
    title: 'Create promotion threats',
    body: 'A Pichu or Pikachu that reaches the far rank promotes to Raichu. A promotion threat forces your opponent to respond. Even if the promotion does not succeed, the distraction can create space elsewhere. Advancing multiple pieces toward promotion simultaneously is a strong strategy because the opponent cannot block all threats at once.',
  },
];

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100dvh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"        style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>{' / '}
        <Link href="/blog"    style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>{' / '}
        <span>Raichu Opening Strategy</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Raichu Opening Strategy: Five Principles for the First Moves
        </h1>
        <div style={{ margin: '0 0 2rem', display: 'flex', justifyContent: 'center' }}>
          <BlogBoardDemo
            initialBoard={OPENING_BOARD}
            sequence={OPENING_SEQ}
            caption="Both sides develop pieces toward the center in the opening"
            squareSize={46}
            intervalMs={1300}
          />
        </div>

        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Raichu has no opening theory. There is no database of memorized sequences to study. What there is: a set of principles that apply in the early game of every match. Learn these and your opening play will be solid regardless of what your opponent does.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {PRINCIPLES.map(({ n, title, body }) => (
              <div key={n} style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--c-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', marginTop: 2 }}>{n}</span>
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.5rem', color: 'var(--c-text)' }}>{title}</h2>
                  <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, margin: 0 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.75rem', color: 'var(--c-text)' }}>The underlying idea</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, margin: 0 }}>
            All five principles point at the same thing: build activity. Pieces doing something are better than pieces doing nothing. A Pichu advancing toward promotion is threatening. A Pikachu in the center is influencing. Your Raichu safe at home is available for the endgame. The player who builds activity fastest usually controls the middle game.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"      style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Practice Now</Link>
          <Link href="/strategy"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Full Strategy Guide</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
