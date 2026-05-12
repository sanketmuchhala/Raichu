import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../lib/seo';
import { SchemaScript } from '../../components/seo/SchemaScript';
import { SeoNav, SeoFooter } from '../../components/seo/SeoFooter';

export const metadata: Metadata = pageMetadata({
  title:       'Abstract Strategy Games: Chess, Go, Hex, Shogi, and Raichu',
  description: 'What are abstract strategy games? Learn the defining features. No luck, perfect information, tactical depth, and discover the best examples to play online.',
  path:        '/abstract-strategy-games',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Abstract Strategy Games: Chess, Go, Hex, Shogi, and Raichu',
  description:'A guide to abstract strategy games: their defining properties, examples, and how to get started.',
  author: { '@type': 'Organization', name: 'Raichu Game' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',                     item: 'https://raichu.live' },
      { '@type': 'ListItem', position: 2, name: 'Abstract Strategy Games',  item: 'https://raichu.live/abstract-strategy-games' },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

export default function AbstractStrategyGamesPage() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <SeoNav />

      <nav aria-label="breadcrumb" style={{ maxWidth: 860, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>
        {' / '}
        <span>Abstract Strategy Games</span>
      </nav>

      <article style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem' }}>
          Abstract Strategy Games
        </h1>
        <p style={{ color: 'var(--c-muted)', marginBottom: '2.5rem', fontSize: '1.0625rem' }}>
          Chess, Go, Hex, Shogi, and Raichu. What they share, why they endure, and how to find the right one for you.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>What Is an Abstract Strategy Game?</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.75, marginBottom: '1rem' }}>
            An abstract strategy game is a game where strategy and tactics are the only factors. The defining properties:
          </p>
          <ul style={{ color: 'var(--c-muted)', lineHeight: 1.9, paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong style={{ color: 'var(--c-text)' }}>No luck.</strong> Dice, cards, or random elements are absent. The outcome depends entirely on player decisions.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Perfect or near-perfect information.</strong> Both players can see the entire game state. Nothing is hidden.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Simple rules, deep mastery.</strong> The rules fit on one page but mastery takes years. The depth emerges from the interactions between simple components.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Deterministic.</strong> The same position with the same move always produces the same result. There are no dice to roll.</li>
          </ul>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.75 }}>
            Abstract strategy games appeal to players who want pure skill competition, where the only variable is how well each player thinks.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Notable Abstract Strategy Games</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              {
                name: 'Chess',
                desc: 'The world\'s most widely played abstract strategy game. Sixteen pieces per side, six piece types, the goal of checkmate. Over a thousand years old with a living global community of millions.',
              },
              {
                name: 'Go',
                desc: 'Played with black and white stones on a 19×19 grid. The rules are among the simplest in abstract strategy; the depth is among the greatest. Go predates chess by centuries and remains the hardest board game for computers to master.',
              },
              {
                name: 'Shogi',
                desc: 'Japanese chess with a twist: captured pieces change sides and can be re-entered. The result is a game with even more tactical density than chess and a different strategic character.',
              },
              {
                name: 'Hex',
                desc: 'Two players connect opposite sides of a diamond-shaped grid. A draw is mathematically impossible. One of the most elegant abstract strategy games ever designed.',
              },
              {
                name: 'Raichu',
                desc: 'A modern browser-based abstract strategy game. Three piece types: Pichu, Pikachu, Raichu. With a movement and capture hierarchy. Played on an 8×8 board. The goal is to capture every enemy piece. Zero luck, no draws, free to play online.',
                cta: true,
              },
            ].map(({ name, desc, cta }) => (
              <div key={name} style={{ backgroundColor: 'var(--c-bg-1)', border: `1px solid ${cta ? 'var(--c-green)' : 'var(--c-border)'}`, borderLeft: `3px solid ${cta ? 'var(--c-green)' : 'var(--c-border)'}`, borderRadius: 10, padding: '1.25rem 1.5rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.375rem' }}>{name}</h3>
                <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, margin: 0, fontSize: '0.9375rem' }}>{desc}</p>
                {cta && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                    <Link href="/play"  style={{ display: 'inline-block', padding: '0.5rem 1.25rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 6, fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem' }}>Play Free</Link>
                    <Link href="/rules" style={{ display: 'inline-block', padding: '0.5rem 1.25rem', backgroundColor: 'var(--c-bg-2)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 6, fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>Rules</Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Why Play Abstract Strategy Games?</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {[
              { label: 'Pure skill',   text: 'No dice, no cards. The better player wins, consistently.' },
              { label: 'Replayable',   text: 'The same rules produce near-infinite variety. A chess or Go position is rarely seen twice.' },
              { label: 'Transferable', text: 'Pattern recognition, planning, and tactical thinking developed in one abstract game carry over to others.' },
              { label: 'No fluff',     text: 'No story, no resource management, no luck mitigation. Just the pure strategic problem.' },
            ].map(({ label, text }) => (
              <div key={label} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--c-green)', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>{label}</div>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"             style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu</Link>
          <Link href="/chess-like-games" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Chess-Like Games</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
