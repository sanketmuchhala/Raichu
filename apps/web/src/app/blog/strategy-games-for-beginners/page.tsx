import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Strategy Board Games for Beginners: Where to Start',
  description: 'The best strategy board games for beginners, ordered by complexity. Start with Raichu or Checkers, build to Hive and Chess, eventually reach Go.',
  path:        '/blog/strategy-games-for-beginners',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Strategy Board Games for Beginners: Where to Start',
  description:'A complexity ladder for beginners learning abstract strategy games.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Strategy Games for Beginners', item: `${SITE_URL}/blog/strategy-games-for-beginners` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

const LADDER = [
  { level: 'Start here', name: 'Raichu', why: 'Three piece types. Five-minute learning curve. Games under 15 minutes. Zero luck. You get fast feedback on your decisions.' },
  { level: 'Start here', name: 'Checkers (Standard)', why: 'Jump captures, diagonal movement, promotion. Simpler than chess but teaches forced captures and piece coordination.' },
  { level: 'Step up', name: 'Hive', why: 'No board, tiles form the play area. Twelve unique pieces. Teaches tactical vision without requiring rule memorization.' },
  { level: 'Step up', name: 'Onitama', why: 'Chess-like but with rotating movement cards. Five pieces per side. Games take 15-20 minutes. Good bridge to chess.' },
  { level: 'Medium depth', name: 'Chess', why: 'The benchmark. Six piece types, many rules to learn, but the depth rewards years of study. Start with rapid (10 minute) games.' },
  { level: 'High depth', name: 'Shogi', why: 'Japanese chess. Captured pieces rejoin your side. More tactical density than Western chess. Harder entry but rewarding.' },
  { level: 'Lifetime game', name: 'Go', why: 'Simple rules, the deepest game in existence. Hard to learn properly without a teacher or structured study. Worth every hour invested.' },
];

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"    style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>{' / '}
        <Link href="/blog" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>{' / '}
        <span>Strategy Games for Beginners</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Strategy Board Games for Beginners: Where to Start
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          The mistake beginners make is starting with chess. Chess has six piece types, dozens of rules to internalize, and an opening theory that takes months to scratch. Better games for absolute beginners give faster feedback with fewer rules to learn. Then you build up.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>The Complexity Ladder</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {LADDER.map(({ level, name, why }) => (
              <div key={name} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1.125rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--c-text)', margin: 0 }}>{name}</h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--c-green)', backgroundColor: 'var(--c-green)22', padding: '0.15rem 0.5rem', borderRadius: 4 }}>{level}</span>
                </div>
                <p style={{ color: 'var(--c-muted)', lineHeight: 1.65, fontSize: '0.9375rem', margin: 0 }}>{why}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>What to Look for in a Beginner Game</h2>
          <ul style={{ color: 'var(--c-muted)', lineHeight: 1.9, paddingLeft: '1.5rem' }}>
            <li><strong style={{ color: 'var(--c-text)' }}>Short games.</strong> Under 20 minutes means more games per session, more feedback loops, faster improvement.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Few piece types.</strong> More piece types mean more rules to hold in your head before you can think tactically.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Zero luck.</strong> If random events can decide the game, your decisions matter less. Zero-luck games give you clean data on your mistakes.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Free or cheap.</strong> Do not spend money on a game until you know you enjoy the genre.</li>
          </ul>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Try Raichu Free</Link>
          <Link href="/rules" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Raichu Rules</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
