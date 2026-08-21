import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Board Games With No Luck | Pure Skill Strategy Games',
  description: 'The best board games with zero luck: Chess, Go, Raichu, Hive, Hex, and more. Games where skill is the only variable and the better player always wins.',
  path:        '/blog/board-games-no-luck',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Board Games With No Luck: Pure Skill Strategy Games',
  description:'A list of board games with zero randomness, where skill is the only determining factor.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  datePublished: '2026-05-12',
  dateModified:  '2026-05-12',
  image:         `${SITE_URL}/opengraph-image`,
  mainEntityOfPage: `${SITE_URL}/blog/board-games-no-luck`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Board Games With No Luck', item: `${SITE_URL}/blog/board-games-no-luck` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

const GAMES = [
  { name: 'Chess', note: 'The most widely played zero-luck game. No dice, no cards, no hidden information. Both players see everything. The better player wins.' },
  { name: 'Go', note: 'Oldest of the zero-luck games. Two players place stones on a 19x19 grid. No randomness at any stage. Solved in theory but not in practice.' },
  { name: 'Raichu', note: 'Three piece types. Capture hierarchy. Promotion. No luck at any step, games in 5-15 minutes. Free in browser.' },
  { name: 'Hive', note: 'Hexagonal tile game with no board. Twelve insect types. No random draw, no cards. The only variable is how well you read the position.' },
  { name: 'Hex', note: 'Connect your two opposite sides before your opponent does. No draws possible. Zero luck, proven mathematically.' },
  { name: 'Shogi', note: 'Japanese chess with one rule that changes everything: captured pieces rejoin your army. No luck, enormous tactical depth.' },
  { name: 'Othello (Reversi)', note: 'Flip opponent pieces. Simple rules, complex endgames. No luck. Good bridge between casual and competitive.' },
  { name: 'Checkers (Draughts)', note: 'International draughts on a 10x10 board has genuine depth. Zero luck. Solved computationally but playable at human level.' },
];

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100dvh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"    style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>{' / '}
        <Link href="/blog" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>{' / '}
        <span>Board Games With No Luck</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Board Games With No Luck: Pure Skill Games
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Most board games contain luck. Dice rolls, card draws, random starting positions. Zero-luck games are different. Every result traces back to a decision. If you lose, you can study why and not lose the same way again. That feedback loop is what makes these games last decades.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>What Makes a Game Zero-Luck</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Three conditions define a pure skill game: no randomness in setup, no randomness during play, and no hidden information. Both players see the complete game state at all times. There is nothing to draw from a deck, nothing that shuffles, no die to roll.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Perfect information is the second requirement. Poker removes luck via randomness but adds hidden cards. Battleship removes randomness but hides ships. Games like Chess and Go have no hidden elements at all.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>The Best Zero-Luck Games</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {GAMES.map(({ name, note }) => (
              <div key={name} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1.125rem 1.25rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.375rem', color: 'var(--c-text)' }}>{name}</h3>
                <p style={{ color: 'var(--c-muted)', lineHeight: 1.65, fontSize: '0.9375rem', margin: 0 }}>{note}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Why Play Zero-Luck Games</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Losing to a dice roll is frustrating in a way that loses its sting over time. Losing to a better move is different: it points at something fixable. The loss contains information. That makes improvement feel possible and meaningful.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            Zero-luck games also age well. You can return to Chess or Go after years away and find the game unchanged. No expansion packs, no power creep, no meta shifts driven by random card pools.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu Free</Link>
          <Link href="/blog/role-of-luck-in-board-games" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Luck in Board Games</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
