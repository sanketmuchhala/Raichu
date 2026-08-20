import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'What Competitive Chess Players Play Next',
  description: 'When chess players want a new challenge: Chess960, Shogi, Go, and Raichu. Games that reset the learning curve and offer depth that rivals standard chess.',
  path:        '/blog/chess-for-competitive-players',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'What Competitive Chess Players Play Next',
  description:'Games chess players move to when they want a new challenge.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  datePublished: '2026-05-12',
  dateModified:  '2026-08-20',
  image:         `${SITE_URL}/opengraph-image`,
  mainEntityOfPage: `${SITE_URL}/blog/chess-for-competitive-players`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Chess for Competitive Players', item: `${SITE_URL}/blog/chess-for-competitive-players` },
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
        <span>Chess for Competitive Players</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          What Competitive Chess Players Play Next
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          After several years of chess, many competitive players reach a point where improvement feels incremental and the game feels familiar. The opening lines are memorized, the endgame principles internalized, the tactical patterns catalogued. What comes next?
        </p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Chess960: The Minimal Change</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Chess960 randomizes the back rank at the start of each game. All other rules are identical to standard chess. Your entire tactical and strategic chess knowledge transfers. Only the opening theory becomes useless.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            For competitive players, this is often the first move because it preserves everything learned while eliminating the staleness that comes from playing memorized opening lines 30 moves deep. Magnus Carlsen won the Chess960 World Championship. It is not a casual variant.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Go: The Deepest Available Game</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Go is the game chess players most often describe as humbling. The rules are simpler than chess. The depth is greater. The branching factor is so high that computers could not beat top professionals until 2016, nearly two decades after Deep Blue beat Kasparov.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Chess skills transfer partially. The instinct to control central territory, to create threats simultaneously, to trade advantageously: these carry over. The specific patterns, the piece values, the endgame techniques: all have to be rebuilt from scratch.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Shogi: Maximum Tactical Density</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Shogi is Japanese chess with fourteen piece types and one rule change that alters everything: captured pieces switch sides and can be re-entered anywhere on the board. This means material is never permanently lost from the game.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            The tactical density is higher than chess. Attacks arrive from unexpected angles because pieces can appear anywhere. Competitive chess players often find Shogi more demanding than chess despite the rule similarities.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Raichu: A Fast Reset</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            For chess players who want a new tactical experience without a long learning investment, Raichu is useful. Three piece types, a clear hierarchy, promotion to the most powerful piece. Games last 5 to 15 minutes.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Chess players often pick up Raichu in a single session because the underlying structure is familiar: material counts, promotion threats, piece coordination. The specific rules are new, which is exactly what makes it interesting after years of chess.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"           style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Try Raichu</Link>
          <Link href="/raichu-vs-chess" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Raichu vs Chess</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
