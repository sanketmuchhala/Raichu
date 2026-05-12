import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoNav, SeoFooter } from '../../../components/seo/SeoFooter';

export const metadata: Metadata = pageMetadata({
  title:       'The Role of Luck in Board Games | Skill vs Chance',
  description: 'From Monopoly to Chess: how luck shapes a board game. Why zero-luck strategy games like Chess, Go, and Raichu create the purest form of skill competition.',
  path:        '/blog/role-of-luck-in-board-games',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'The Role of Luck in Board Games',
  description:'An analysis of how luck affects board games, why zero-luck abstract strategy games appeal to competitive players, and how Raichu fits the no-luck model.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'The Role of Luck in Board Games', item: `${SITE_URL}/blog/role-of-luck-in-board-games` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;
const pStyle  = { color: 'var(--c-muted)', lineHeight: 1.75, marginBottom: '1rem' } as const;

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <SeoNav />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"     style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>
        {' / '}
        <Link href="/blog" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>
        {' / '}
        <span>The Role of Luck in Board Games</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          The Role of Luck in Board Games
        </h1>
        <p style={{ ...pStyle, fontSize: '1.0625rem' }}>
          All board games sit somewhere on a spectrum between pure luck and pure skill. Where a game lands on that spectrum determines what kind of players it rewards — and what kind of experience it creates.
        </p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>The Luck–Skill Spectrum</h2>
          <p style={pStyle}>At one end: games of pure luck. At the other: games of pure skill.</p>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '1.25rem' }}>
            {[
              { label: 'Pure luck',  ex: 'Snakes and Ladders, War', desc: 'Player decisions have no effect on the outcome. The dice decide everything.' },
              { label: 'Mostly luck', ex: 'Monopoly, Ludo',         desc: 'A few decisions, but luck dominates. Better players win more often over many games, not individual games.' },
              { label: 'Mixed',      ex: 'Poker, Backgammon',        desc: 'Real decisions with real consequences, but randomness introduces variance. Skill wins long-term; luck wins short-term.' },
              { label: 'Pure skill', ex: 'Chess, Go, Raichu',        desc: 'No randomness. Every outcome is the direct result of decision quality. The better player wins — every time, not just on average.' },
            ].map(({ label, ex, desc }) => (
              <div key={label} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--c-green)', marginBottom: '0.2rem', fontSize: '0.9375rem' }}>{label}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--c-text)', marginBottom: '0.375rem', fontStyle: 'italic' }}>Examples: {ex}</div>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Why Luck Is Added to Board Games</h2>
          <p style={pStyle}>
            Luck is not a design flaw — it is a design choice. It serves real purposes:
          </p>
          <ul style={{ color: 'var(--c-muted)', lineHeight: 1.9, paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong style={{ color: 'var(--c-text)' }}>Accessibility.</strong> Luck lets beginners sometimes beat experts. This makes games more enjoyable for mixed-skill groups and keeps new players engaged longer.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Tension management.</strong> Randomness creates unexpected situations and swings that generate emotional highs and lows, which many players find entertaining.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Reduced memorization demands.</strong> When the game state partially depends on chance, less can be memorized. Each session starts fresher.</li>
          </ul>
          <p style={pStyle}>
            None of these apply when the goal is pure skill competition. For competitive players — people who want to know that their win reflects their ability — luck is noise, not signal.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>What Zero-Luck Games Offer</h2>
          <p style={pStyle}>
            Pure-skill games create a different relationship between player and game. When luck is removed:
          </p>
          <ul style={{ color: 'var(--c-muted)', lineHeight: 1.9, paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Every loss is instructive. There is no "the dice were against me." Something went wrong — find it and improve.</li>
            <li>Skill compounds. Time invested in study and practice translates directly into better results. The improvement curve is steeper and more satisfying.</li>
            <li>Rematches are meaningful. If player A beats player B, the rematch will likely go the same way — unless B genuinely improves. This makes competitive games feel real.</li>
            <li>Ratings work. Because luck does not interfere, ELO-style rating systems accurately reflect ability levels. You can measure your actual improvement.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Chess, Go, and Raichu as Pure-Skill Games</h2>
          <p style={pStyle}>
            Chess has no dice, no cards, no hidden information. The same is true of Go and Raichu. In all three, both players see the entire board at all times, and every decision is made with complete information. The result is determined entirely by who plays better.
          </p>
          <p style={pStyle}>
            Raichu specifically has zero randomness. The starting position is fixed and symmetric. White always moves first. No cards, no dice, no hidden pieces. The game is fully deterministic from the opening move.
          </p>
          <p style={pStyle}>
            This means a consistent player will consistently beat a weaker one. It also means improvement is transparent and trackable — if you are losing positions you used to win, something in your play has gotten worse, not luckier.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Does Zero Luck Mean Zero Fun?</h2>
          <p style={pStyle}>
            Luck games are fun. But pure-skill games produce a different kind of satisfaction: the satisfaction of genuine mastery. Winning a chess or Raichu game does not feel lucky — it feels earned. Losing does not feel unfair — it feels like useful feedback.
          </p>
          <p style={pStyle}>
            The tension in pure-skill games comes from uncertainty about what the opponent will do next, not from dice. The surprise comes from pattern recognition failing or succeeding at unexpected moments. That is a richer kind of drama for many players.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"                        style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu Free</Link>
          <Link href="/abstract-strategy-games"     style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Abstract Strategy Games</Link>
          <Link href="/blog"                        style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>More Articles</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
