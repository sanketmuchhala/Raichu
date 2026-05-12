import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoNav, SeoFooter } from '../../../components/seo/SeoFooter';

export const metadata: Metadata = pageMetadata({
  title:       'Raichu for Chess Players: Why You Should Try It | Raichu Game Blog',
  description: 'Chess players will recognize piece hierarchy, promotion tension, and positional depth. Here is what feels familiar in Raichu, and what is refreshingly different.',
  path:        '/blog/raichu-for-chess-players',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Raichu for Chess Players: Why You Should Try It',
  description:'A guide for chess players explaining how Raichu applies familiar chess instincts in a new context, and what makes it a rewarding game in its own right.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Raichu for Chess Players', item: `${SITE_URL}/blog/raichu-for-chess-players` },
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
        <span>Raichu for Chess Players</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Raichu for Chess Players: Why You Should Try It
        </h1>
        <p style={{ ...pStyle, fontSize: '1.0625rem' }}>
          If you play chess, you already have the mindset Raichu rewards. Here is what transfers directly, what you need to unlearn, and what makes Raichu worth your time.
        </p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>What Chess Players Already Know</h2>
          <p style={pStyle}>
            Chess players come to Raichu with real advantages. The skills that make you good at chess are the skills that make you good at Raichu:
          </p>
          <ul style={{ color: 'var(--c-muted)', lineHeight: 1.9, paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong style={{ color: 'var(--c-text)' }}>Pattern recognition.</strong> Tactical patterns. forks, skewers, zugzwang-like positions. exist in Raichu. The patterns look different but the underlying logic is the same. Experience at spotting chess tactics makes you faster at spotting Raichu tactics.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Piece coordination.</strong> A single powerful piece is easier to deal with than two coordinated ones. This principle holds in Raichu: two Raichus working together are nearly unbeatable; one isolated Raichu is vulnerable.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Promotion instinct.</strong> Chess players understand promotion pressure viscerally. Raichu's promotion mechanic is the central strategic goal of the game. A Pichu or Pikachu close to the back row is an urgent threat that demands an immediate response. exactly like a passed pawn in chess.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Tempo.</strong> The concept of not wasting moves, of making threats that demand responses, of forcing rather than waiting. all of this carries over unchanged.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>What You Need to Unlearn</h2>
          <p style={pStyle}>
            Chess habits that will mislead you in Raichu:
          </p>
          <ul style={{ color: 'var(--c-muted)', lineHeight: 1.9, paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong style={{ color: 'var(--c-text)' }}>Targeting the king.</strong> There is no king. The win condition is capturing every enemy piece, not a single target. You must think about eliminating the entire army, not just threatening one piece.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Any piece can take any piece.</strong> In chess, a pawn can capture a queen if placed correctly. In Raichu, Pichus can only capture other Pichus. This capture hierarchy creates completely different tactical calculations.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Drawn positions exist.</strong> In Raichu, there are no draws. Every game ends with a winner. A position that would be a dead draw in chess still has a result in Raichu. Play through positions you would offer a draw in chess.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Backward movement is available.</strong> Pichus and Pikachus cannot move backward. This is not chess, where most pieces can move in any direction. Spatial awareness of forward-only movement creates different positional dynamics.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>What Makes Raichu Worth Playing on Its Own Terms</h2>
          <p style={pStyle}>
            Beyond the chess connection, Raichu has qualities that stand independently:
          </p>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {[
              { label: 'Fast games', text: '5–15 minutes. No marathon endgames. You can play three games in the time a single chess game takes.' },
              { label: 'No opening theory', text: 'Raichu has no established opening book. Every opening is uncharted. Chess intuition applies but memorization does not.' },
              { label: 'No draws', text: 'Every game produces a result. No fifty-move rule, no threefold repetition, no agreed draws. Close games always have a winner.' },
              { label: 'Free, instant play', text: 'No installation, no account required for the AI. Open the browser and start playing.' },
            ].map(({ label, text }) => (
              <div key={label} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--c-green)', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>{label}</div>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>How Long Does It Take to Get Started?</h2>
          <p style={pStyle}>
            A chess player can read the rules in five minutes. The piece movements are simpler than chess (three piece types vs six, no castling, no en passant). In the first game you will make tactical errors: the capture hierarchy trips up everyone initially, but you will be thinking strategically from the very first move.
          </p>
          <p style={pStyle}>
            By your third or fourth game, the unfamiliar mechanics become automatic and you start to see the deeper structure. At that point, your chess instincts take over and the game becomes genuinely challenging.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"            style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Try Raichu Now</Link>
          <Link href="/raichu-vs-chess" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Raichu vs Chess</Link>
          <Link href="/rules"           style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Read the Rules</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
