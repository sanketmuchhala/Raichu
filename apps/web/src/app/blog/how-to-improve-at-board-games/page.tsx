import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'How to Improve at Strategy Board Games | 7 Practical Tips',
  description: 'Concrete advice for getting better at abstract strategy games like Chess, Go and Raichu. Study your losses, learn piece value, think in patterns.',
  path:        '/blog/how-to-improve-at-board-games',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'How to Improve at Strategy Board Games',
  description:'Seven practical tips for getting better at abstract strategy games.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  datePublished: '2026-05-12',
  dateModified:  '2026-08-20',
  image:         `${SITE_URL}/opengraph-image`,
  mainEntityOfPage: `${SITE_URL}/blog/how-to-improve-at-board-games`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'How to Improve at Board Games', item: `${SITE_URL}/blog/how-to-improve-at-board-games` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

const TIPS = [
  {
    n: 1,
    title: 'Slow down before moving',
    body: 'Most mistakes happen when players move before fully considering the position. Before touching a piece, ask: what is my opponent\'s best response to this move? If you cannot answer, do not move yet. This single habit eliminates entire categories of blunders.',
  },
  {
    n: 2,
    title: 'Study your losses, not your wins',
    body: 'After a win, everything you did looks correct. After a loss, you have a specific position where the game turned. That position contains a lesson. The question is: what was the last moment I was equal, and what did I do wrong? Finding that move is more valuable than replaying ten wins.',
  },
  {
    n: 3,
    title: 'Understand piece values',
    body: 'Every strategy game assigns value to pieces through their movement and capture power. In Chess: queen beats rook beats bishop or knight beats pawn. In Raichu: Raichu beats everything, Pikachu beats Pichu and Pikachu, Pichu beats only Pichu. Know these hierarchies cold. Trading a more powerful piece for a weaker one is losing ground you may never recover.',
  },
  {
    n: 4,
    title: 'Count material before trading',
    body: 'Before any exchange, count what you give up versus what you gain. If the trade is even, evaluate the resulting position: does it favor you? Never make trades reflexively. Every exchange changes the board state permanently.',
  },
  {
    n: 5,
    title: 'Control the center',
    body: 'Pieces placed in the center of the board influence more squares than pieces on the edges. This is true in Chess, Raichu, and most abstract games. A piece in the center creates threats in multiple directions. A piece in the corner has limited reach.',
  },
  {
    n: 6,
    title: 'Develop all your pieces',
    body: 'One powerful piece does less than three coordinated pieces. A pattern beginners fall into: they move the same piece repeatedly while half their army sits unmoved. In Raichu, all your Pichus and Pikachus need to advance. In Chess, develop your pieces before attacking.',
  },
  {
    n: 7,
    title: 'Play against stronger opponents',
    body: 'Playing against weaker opponents builds bad habits. Playing against stronger opponents reveals weaknesses you did not know you had. Losing a lot to a better player is faster improvement than winning a lot against weaker ones.',
  },
];

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100dvh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"    style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>{' / '}
        <Link href="/blog" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>{' / '}
        <span>How to Improve at Board Games</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          How to Improve at Strategy Board Games
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Getting better at zero-luck strategy games is not mysterious. There are no shortcuts, but there are clear practices that produce improvement. These tips apply to Chess, Go, Raichu, Hive, and any other abstract strategy game.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {TIPS.map(({ n, title, body }) => (
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
          <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.75rem', color: 'var(--c-text)' }}>A note on game selection</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, margin: 0 }}>
            If you are new to strategy games, start with a game that gives fast feedback. Chess games can last an hour, which means slow improvement cycles. Raichu games last 5 to 15 minutes. You can play 10 games in the time you would play 2 chess games, and each loss teaches you something new.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"      style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Practice Now</Link>
          <Link href="/strategy"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Raichu Strategy Guide</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
