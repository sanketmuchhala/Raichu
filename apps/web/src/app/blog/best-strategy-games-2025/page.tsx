import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Best Strategy Games 2026 | Top Abstract Games to Play',
  description: 'The best strategy games to play in 2026: Raichu, Chess, Go, Hive, Onitama, and more. Zero luck, deep tactics, playable in a browser or with a physical set.',
  path:        '/blog/best-strategy-games-2025',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Best Strategy Games 2026',
  description:'The top abstract strategy games to play in 2026, ranked and explained.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Best Strategy Games 2026', item: `${SITE_URL}/blog/best-strategy-games-2025` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

const PICKS = [
  { name: 'Raichu',              where: 'Browser (free)',          why: 'Chess depth in 15 minutes. No account required. Best option for getting started with abstract strategy right now.' },
  { name: 'Chess',               where: 'Lichess, Chess.com',      why: 'Timeless. The most developed competitive scene. AI opponents at every level. Hundreds of thousands of active players.' },
  { name: 'Go',                  where: 'KGS, OGS, Fox Go Server', why: 'The deepest game available. If you want a lifelong pursuit, this is it. Free online servers have millions of active players.' },
  { name: 'Hive',                where: 'Board Game Arena, iOS',   why: 'The best physical two-player abstract game of the last decade. Works digitally or as a physical set you carry anywhere.' },
  { name: 'Onitama',             where: 'Board Game Arena',        why: 'Every game plays differently due to rotating movement cards. Fifteen minutes, fierce, no two games alike.' },
  { name: 'Chess960',            where: 'Lichess, Chess.com',      why: 'Best entry point for chess players who want to escape opening theory without learning a new game entirely.' },
];

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"    style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>{' / '}
        <Link href="/blog" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>{' / '}
        <span>Best Strategy Games 2026</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Best Strategy Games to Play in 2026
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          The best strategy games are the ones that have lasted decades and will last decades more. This list focuses on abstract strategy: zero luck, two players, pure skill. These games do not need updates, expansions, or battle passes. They are already complete.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>The Picks</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {PICKS.map(({ name, where, why }, i) => (
              <div key={name} style={{ display: 'flex', gap: '1rem', backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1.25rem' }}>
                <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', backgroundColor: i === 0 ? 'var(--c-green)' : 'var(--c-bg-2)', color: i === 0 ? '#fff' : 'var(--c-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', marginTop: 2 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: i === 0 ? 'var(--c-green)' : 'var(--c-text)', margin: 0 }}>{name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)', backgroundColor: 'var(--c-bg-2)', padding: '0.15rem 0.5rem', borderRadius: 4 }}>{where}</span>
                  </div>
                  <p style={{ color: 'var(--c-muted)', lineHeight: 1.65, fontSize: '0.9375rem', margin: 0 }}>{why}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>What Has Changed in 2026</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Not much. The best abstract strategy games are stable by design. Chess and Go are unchanged. What has changed is the quality of online platforms. Browser-based play is now smooth enough that there is no meaningful difference between playing online and playing in person.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Raichu is new enough that its online community is still growing. Playing now means finding opponents at every skill level as the player base expands.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu Now</Link>
          <Link href="/lobby" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Find an Opponent</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
