import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../lib/seo';
import { SchemaScript } from '../../components/seo/SchemaScript';
import { SeoFooter } from '../../components/seo/SeoFooter';
import { Navbar } from '../../components/nav/Navbar';

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
  // Raichu guides
  {
    slug:    'raichu-piece-guide',
    title:   'Raichu Piece Guide: How Pichu, Pikachu, and Raichu Work',
    excerpt: 'Complete movement and capture rules for every piece. Promotion mechanics. Strategic role of each tier in the hierarchy.',
    tags:    ['Raichu', 'Rules', 'Guide'],
  },
  {
    slug:    'raichu-opening-strategy',
    title:   'Raichu Opening Strategy: Five First-Move Principles',
    excerpt: 'Advance Pichus, develop Pikachus, protect your Raichu, contest the center, create promotion threats. Principles that work in every game.',
    tags:    ['Raichu', 'Strategy', 'Opening'],
  },
  {
    slug:    'raichu-endgame-strategy',
    title:   'Raichu Endgame Strategy: Converting Winning Positions',
    excerpt: 'Raichu dominance, promotion racing, cutting off pieces with no legal moves. How to finish games once you have the advantage.',
    tags:    ['Raichu', 'Strategy', 'Endgame'],
  },
  // Chess comparisons
  {
    slug:    'what-makes-a-game-chess-like',
    title:   'What Makes a Game Chess-Like?',
    excerpt: 'Piece hierarchy, no luck, perfect information. Defining the qualities that make abstract strategy games feel like chess. and where Raichu fits.',
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
    excerpt: 'Chess players will recognize the piece hierarchy, promotion tension, and positional depth. Here is what is familiar and what is refreshingly different.',
    tags:    ['Chess', 'Raichu', 'Comparison'],
  },
  {
    slug:    'raichu-vs-checkers',
    title:   'Raichu vs Checkers: Two Promotion-Based Games Compared',
    excerpt: 'Both games center on promotion. How they compare on movement, capture systems, depth, game length, and which to learn first.',
    tags:    ['Raichu', 'Checkers', 'Comparison'],
  },
  {
    slug:    'chess-without-memorization',
    title:   'Strategy Games Without Opening Memorization',
    excerpt: 'Chess960, Onitama, and Raichu all eliminate theory from the opening. Every game starts fresh. No database needed.',
    tags:    ['Chess', 'Chess960', 'Opening Theory'],
  },
  {
    slug:    'chess-for-competitive-players',
    title:   'What Competitive Chess Players Play Next',
    excerpt: 'Chess960, Go, Shogi, and Raichu. Games that reset the learning curve for players who have exhausted standard chess.',
    tags:    ['Chess', 'Go', 'Shogi'],
  },
  // Abstract strategy
  {
    slug:    'piece-hierarchy-in-board-games',
    title:   'How Piece Hierarchies Work in Strategy Games',
    excerpt: 'Capture restrictions in Chess, Raichu, and Shogi. Why hierarchies create tactics, and how enforced vs emergent hierarchies differ.',
    tags:    ['Game Design', 'Chess', 'Abstract Strategy'],
  },
  {
    slug:    'abstract-strategy-games-for-beginners',
    title:   'Abstract Strategy Games for Beginners',
    excerpt: 'What abstract strategy means, why it is worth playing, and which game to start with. A practical getting-started guide.',
    tags:    ['Beginners', 'Abstract Strategy', 'Guide'],
  },
  {
    slug:    'strategy-games-for-beginners',
    title:   'Strategy Board Games for Beginners: Where to Start',
    excerpt: 'A complexity ladder from Raichu and Checkers through Hive, Onitama, Chess, and Go. Start simple, build up.',
    tags:    ['Beginners', 'Strategy', 'List'],
  },
  {
    slug:    'why-play-strategy-games',
    title:   'Why Abstract Strategy Games Are Worth Your Time',
    excerpt: 'Clean feedback, skill that compounds, no expansion packs, depth that never bottoms out. The case for zero-luck games.',
    tags:    ['Abstract Strategy', 'Game Theory'],
  },
  {
    slug:    'board-games-no-luck',
    title:   'Board Games With No Luck: Pure Skill Games',
    excerpt: 'Chess, Go, Raichu, Hive, Hex, Shogi, Othello. What makes a game zero-luck and why it matters for improvement.',
    tags:    ['No Luck', 'Abstract Strategy', 'List'],
  },
  {
    slug:    'role-of-luck-in-board-games',
    title:   'The Role of Luck in Board Games',
    excerpt: 'From Monopoly to Chess: how luck changes a game\'s character. Why zero-luck games create the purest skill competition.',
    tags:    ['Game Theory', 'No Luck', 'Abstract Strategy'],
  },
  // Multiplayer / online
  {
    slug:    'best-two-player-games-online',
    title:   'Best Two Player Board Games for Adults',
    excerpt: 'Chess, Go, Raichu, Hive, Onitama, 7 Wonders Duel, Lost Cities. Ranked by depth and replayability with time estimates.',
    tags:    ['Two Player', 'Adults', 'List'],
  },
  {
    slug:    'free-two-player-games-online',
    title:   'Free Two Player Games Online: No Download Required',
    excerpt: 'Raichu, Lichess, Board Game Arena, PlayStrategy, and more. Platforms for free online two-player play that work in any browser.',
    tags:    ['Free', 'Online', 'Two Player'],
  },
  {
    slug:    'two-player-games-no-account',
    title:   'Two Player Games With No Account Required',
    excerpt: 'Play immediately: Raichu local PvP, Raichu vs AI, Lichess vs friend link. Zero registration paths to a real game.',
    tags:    ['No Account', 'Quick Play', 'Two Player'],
  },
  {
    slug:    'online-board-games-no-download',
    title:   'Online Board Games That Need No Download',
    excerpt: 'Browser-based board games that work without installing anything. Raichu, Lichess, Board Game Arena, Pychess.',
    tags:    ['Browser Games', 'No Download', 'Online'],
  },
  // Speed / format
  {
    slug:    'fast-strategy-games',
    title:   'Fast Strategy Games: Depth in Under 20 Minutes',
    excerpt: 'Raichu, Onitama, Blitz Chess, Hive, Othello. Strategy games that compress meaningful decisions into a short window.',
    tags:    ['Fast Games', 'Strategy', 'Time'],
  },
  {
    slug:    'best-free-browser-strategy-games',
    title:   'Best Free Browser Strategy Games You Can Play Now',
    excerpt: 'Lichess, PlayStrategy, PlayAbstractGames, and Raichu. The best abstract strategy games free in a browser. No download, no account required.',
    tags:    ['Browser Games', 'Free', 'Strategy'],
  },
  {
    slug:    'best-strategy-games-2025',
    title:   'Best Strategy Games to Play in 2025',
    excerpt: 'Raichu, Chess, Go, Hive, Onitama, Chess960. Games that do not need updates or expansions because they are already complete.',
    tags:    ['2025', 'Strategy', 'List'],
  },
  {
    slug:    'how-to-improve-at-board-games',
    title:   'How to Improve at Strategy Board Games',
    excerpt: 'Seven concrete practices: slow down before moving, study losses not wins, count material, control the center, develop all pieces.',
    tags:    ['Improvement', 'Strategy', 'Tips'],
  },
];

export default function BlogPage() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

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
