import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Raichu vs Checkers: Strategy Games Compared',
  description: 'Raichu and Checkers both center on promotion. How they compare: movement rules, capture systems, game length, depth, and which to play first.',
  path:        '/blog/raichu-vs-checkers',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Raichu vs Checkers: Strategy Games Compared',
  description:'A direct comparison of Raichu and Checkers: rules, depth, game length, and strategic character.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Raichu vs Checkers', item: `${SITE_URL}/blog/raichu-vs-checkers` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

const COMPARISON = [
  { aspect: 'Board',         raichu: '8x8, orthogonal start positions', checkers: '8x8, diagonal start positions' },
  { aspect: 'Piece types',   raichu: '3 (Pichu, Pikachu, Raichu)',     checkers: '2 (Man, King)' },
  { aspect: 'Movement',      raichu: 'Varies by piece type',             checkers: 'Diagonal only, all pieces' },
  { aspect: 'Promotion',     raichu: 'Pichu/Pikachu become Raichu',     checkers: 'Man becomes King' },
  { aspect: 'Captures',      raichu: 'Hierarchy-restricted',             checkers: 'Jump-only, mandatory' },
  { aspect: 'Game length',   raichu: '5-15 minutes',                    checkers: '15-40 minutes' },
  { aspect: 'Luck',          raichu: 'Zero',                            checkers: 'Zero' },
  { aspect: 'Draws',         raichu: 'None',                            checkers: 'Possible' },
];

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"    style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>{' / '}
        <Link href="/blog" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>{' / '}
        <span>Raichu vs Checkers</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Raichu vs Checkers: Promotion-Based Strategy Games Compared
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Both Raichu and Checkers are built around promotion: advancing pieces to the far end of the board to unlock a more powerful form. Both are zero-luck abstract games on an 8x8 grid. The similarities end there.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Side by Side</h2>
          <div style={{ border: '1px solid var(--c-border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', backgroundColor: 'var(--c-bg-2)' }}>
              {['Aspect', 'Raichu', 'Checkers'].map((h) => (
                <div key={h} style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--c-muted)', borderBottom: '1px solid var(--c-border)' }}>{h}</div>
              ))}
            </div>
            {COMPARISON.map(({ aspect, raichu, checkers }, i) => (
              <div key={aspect} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', backgroundColor: i % 2 === 0 ? 'var(--c-bg-1)' : 'transparent' }}>
                <div style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--c-text)', borderBottom: '1px solid var(--c-border)' }}>{aspect}</div>
                <div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--c-muted)', borderBottom: '1px solid var(--c-border)', borderLeft: '1px solid var(--c-border)' }}>{raichu}</div>
                <div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--c-muted)', borderBottom: '1px solid var(--c-border)', borderLeft: '1px solid var(--c-border)' }}>{checkers}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>The Key Differences</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            <strong style={{ color: 'var(--c-text)' }}>Capture hierarchy.</strong> In Checkers, any piece can capture any other piece. In Raichu, capture rights are restricted by piece type. A Pichu cannot take a Pikachu under any circumstances. This single rule creates a layer of strategic complexity that Checkers lacks.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            <strong style={{ color: 'var(--c-text)' }}>Mandatory captures.</strong> Standard Checkers requires you to capture if you can. Raichu has no mandatory captures. This gives Raichu players more choice, which increases the complexity of position evaluation.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            <strong style={{ color: 'var(--c-text)' }}>Three piece types vs two.</strong> Checkers has Man and King. Raichu has Pichu, Pikachu, and Raichu. The middle tier, Pikachu, adds a distinct strategic layer: pieces that beat Pichus but cannot touch Raichupromoted pieces.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--c-text)' }}>No draws in Raichu.</strong> Checkers can end in a draw when neither side can make progress. Raichu cannot draw because a player with no legal moves loses.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Which to Play First</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Checkers is slightly simpler and a good introduction to diagonal movement and promotion. Raichu is more complex but has shorter games. If you have never played either, Raichu is a better choice because the game ends quickly and you get faster feedback. If you want the simplest possible introduction to abstract strategy, Checkers is slightly easier to explain to someone who has never played either.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu Free</Link>
          <Link href="/rules" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Full Rules</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
