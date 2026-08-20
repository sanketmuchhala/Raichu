import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Chess Without Opening Memorization | Skip the Theory',
  description: 'Tired of memorizing chess openings? These strategy games eliminate theory entirely: Chess960, Onitama, and Raichu all force you to think from move one.',
  path:        '/blog/chess-without-memorization',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Strategy Games Without Opening Memorization',
  description:'Games that fix chess\'s memorization problem by making every opening position fresh.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  datePublished: '2026-05-12',
  dateModified:  '2026-08-20',
  image:         `${SITE_URL}/opengraph-image`,
  mainEntityOfPage: `${SITE_URL}/blog/chess-without-memorization`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Chess Without Memorization', item: `${SITE_URL}/blog/chess-without-memorization` },
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
        <span>Chess Without Memorization</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Chess Without Memorization: Games That Start Fresh Every Time
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Modern chess at even an intermediate level requires memorizing 15 to 20 moves of opening theory in multiple lines. That is not chess thinking. That is recall. Several games fix this problem by design.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>The Opening Theory Problem</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Chess was not always this memorization-heavy. Before computers catalogued every line, players reached original positions in 6 or 7 moves. Today, high-level games follow known theory for 20, 30, even 40 moves before either player makes an original decision.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            For casual and club players, this creates a specific frustration: you spend time learning the Sicilian Defense only to face a sideline your opponent knows better. The game is decided before it starts.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Three games solve this in different ways.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Chess960 (Fischer Random)</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Invented by Bobby Fischer. The back rank pieces are randomized at the start of each game, with bishops on opposite colors and the king between the rooks. All 960 possible arrangements are legal. Opening books become useless instantly.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Every other rule is standard chess. Players who know chess know Chess960 immediately. The randomization is the only change. It works because it targets the problem precisely.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Onitama</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Five-by-five grid. Five pieces per side. Two movement cards determine how pieces can move each turn. After using a card, it passes to your opponent. From a set of 16 cards, five are chosen randomly at the start.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            No two games share the same movement rules. There is no theory to memorize because the rules change every game. Onitama rewards reading the current card set, not a book.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Raichu</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Three piece types: Pichu, Pikachu, and Raichu. The starting position is fixed, but the piece types are simple enough that there is no opening theory to memorize. Games last 5 to 15 minutes.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Raichu borrows what makes chess interesting, the piece hierarchy and promotion tension, and removes what makes chess inaccessible. There are no opening books, no databases, no 40-move preparation lines.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Every game is decided by over-the-board thinking from the first move.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"              style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu Free</Link>
          <Link href="/raichu-vs-chess"   style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Raichu vs Chess</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
