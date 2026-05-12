import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../lib/seo';
import { SchemaScript } from '../../components/seo/SchemaScript';
import { SeoNav, SeoFooter } from '../../components/seo/SeoFooter';

export const metadata: Metadata = pageMetadata({
  title:       'Raichu Game Blog | Strategy Guides and Abstract Board Game Articles',
  description: 'Articles on Raichu strategy, abstract board games, chess-like games, and game design. Guides for beginners and experienced players.',
  path:        '/blog',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Blog',
  name:       'Raichu Game Blog',
  description:'Strategy guides, abstract game comparisons, and board game articles.',
  url:        `${SITE_URL}/blog`,
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
};

const ARTICLES = [
  {
    slug:    'what-makes-a-game-chess-like',
    title:   'What Makes a Game Chess-Like?',
    excerpt: 'Piece hierarchy, no luck, perfect information. Defining the qualities that make abstract strategy games feel like chess — and where Raichu fits.',
    tags:    ['Chess', 'Abstract Strategy', 'Game Design'],
  },
  {
    slug:    'games-like-chess',
    title:   'Top 10 Strategy Games Like Chess',
    excerpt: 'Chess960, Shogi, Go, Hex, Hive, Onitama, Arimaa, Xiangqi, Checkers, and Raichu. The best strategy games for chess players looking for something new.',
    tags:    ['Games Like Chess', 'Strategy', 'List'],
  },
  {
    slug:    'raichu-for-chess-players',
    title:   'Raichu for Chess Players: Why You Should Try It',
    excerpt: 'Chess players will recognize the piece hierarchy, promotion tension, and positional depth. Here is what is familiar — and what is refreshingly different.',
    tags:    ['Chess', 'Raichu', 'Comparison'],
  },
  {
    slug:    'best-free-browser-strategy-games',
    title:   'Best Free Browser Strategy Games You Can Play Now',
    excerpt: 'Lichess, PlayStrategy, PlayAbstractGames, and Raichu. The best abstract strategy games you can play free in a browser — no download, no account required.',
    tags:    ['Browser Games', 'Free', 'Strategy'],
  },
  {
    slug:    'role-of-luck-in-board-games',
    title:   'The Role of Luck in Board Games',
    excerpt: 'From Monopoly to Chess: how luck changes a game\'s character. Why zero-luck games like Chess, Go, and Raichu create the purest skill competition.',
    tags:    ['Game Theory', 'No Luck', 'Abstract Strategy'],
  },
];

export default function BlogPage() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <SeoNav />

      <nav aria-label="breadcrumb" style={{ maxWidth: 860, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>
        {' / '}
        <span>Blog</span>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem' }}>
          Raichu Game Blog
        </h1>
        <p style={{ color: 'var(--c-muted)', marginBottom: '2.5rem', fontSize: '1.0625rem' }}>
          Strategy guides, abstract game comparisons, and articles for tactical thinkers.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {ARTICLES.map(({ slug, title, excerpt, tags }) => (
            <Link
              key={slug}
              href={`/blog/${slug}`}
              style={{ textDecoration: 'none' }}
            >
              <article className="blog-card">
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--c-text)', marginBottom: '0.5rem' }}>{title}</h2>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '0.75rem' }}>{excerpt}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {tags.map((tag) => (
                    <span key={tag} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 99, backgroundColor: 'var(--c-bg-2)', color: 'var(--c-muted)' }}>{tag}</span>
                  ))}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      <SeoFooter />
    </main>
  );
}
