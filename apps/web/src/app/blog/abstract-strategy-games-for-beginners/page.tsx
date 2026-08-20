import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Abstract Strategy Games for Beginners: Start Here',
  description: 'What abstract strategy games are, why they are worth playing, and which ones to start with. A practical guide for complete beginners.',
  path:        '/blog/abstract-strategy-games-for-beginners',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Abstract Strategy Games for Beginners',
  description:'A getting-started guide for players new to abstract strategy games.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  datePublished: '2026-05-12',
  dateModified:  '2026-08-20',
  image:         `${SITE_URL}/opengraph-image`,
  mainEntityOfPage: `${SITE_URL}/blog/abstract-strategy-games-for-beginners`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Abstract Strategy Games for Beginners', item: `${SITE_URL}/blog/abstract-strategy-games-for-beginners` },
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
        <Link href="/"    style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>{' / '}
        <Link href="/blog" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>{' / '}
        <span>Abstract Strategy Games for Beginners</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Abstract Strategy Games for Beginners
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Abstract strategy games are the category that includes Chess, Go, Checkers, and dozens of lesser-known games. They share a few traits: no luck, no hidden information, two players, and a clear win condition. If you have never played one seriously, here is how to get started.
        </p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>What Makes a Game Abstract</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            The term covers games with no theme, no story, and no randomness. The rules are mathematical: pieces move according to fixed laws, captures follow defined conditions, and the game ends when one player achieves the objective.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Both players see the entire board at all times. There is no hidden hand of cards, no fog of war, no dice to roll. Every outcome is determined by decisions alone.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Why They Are Worth Playing</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            The feedback loop is clean. If you lose, you made a mistake. You can find that mistake, understand it, and not make it again. Progress is measurable in a way it is not in luck-based games.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            They also age well. Chess has not changed in centuries. Go has not changed in over a thousand years. The skill ceiling is effectively infinite: no matter how strong you get, there is always a stronger player or a deeper line to explore.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            And they are cheap. The best ones are free online.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Where to Start</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Do not start with Chess or Go. Both are genuinely deep but have steep early learning curves that slow feedback. Start with something simpler that still captures the core appeal.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { name: 'Raichu', desc: 'Three pieces, clear hierarchy, 5-15 minute games. Teaches piece value and promotion pressure with a short rules list.' },
              { name: 'Checkers', desc: 'Jump captures and promotion. Standard rules are simple enough to learn in two minutes. A good first abstract game.' },
              { name: 'Hive', desc: 'No board, tiles form the play area. Physical and tactile. Good for players who like puzzles.' },
            ].map(({ name, desc }) => (
              <div key={name} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1rem 1.25rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--c-text)', marginBottom: '0.375rem' }}>{name}</h3>
                <p style={{ color: 'var(--c-muted)', lineHeight: 1.65, fontSize: '0.9375rem', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>The First 10 Games</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Your first 10 games in any abstract strategy game will feel like losing constantly. This is normal. The patterns that experienced players see instantly take time to build. The key is to play games to completion, not quit when behind, and after each loss ask: what was the last move where I was equal? That question, applied consistently, is how you improve.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Start with Raichu</Link>
          <Link href="/rules" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Learn the Rules</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
