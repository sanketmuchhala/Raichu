import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Why Play Abstract Strategy Games | The Case for Zero-Luck Games',
  description: 'Why abstract strategy games like Chess, Go, and Raichu are worth your time: clean feedback, no luck, skill that compounds, and games that never go stale.',
  path:        '/blog/why-play-strategy-games',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Why Play Abstract Strategy Games',
  description:'The case for playing zero-luck strategy games over luck-based games.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Why Play Strategy Games', item: `${SITE_URL}/blog/why-play-strategy-games` },
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
        <span>Why Play Strategy Games</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Why Abstract Strategy Games Are Worth Your Time
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Most games mix skill with luck. Rolling dice, drawing cards, and random events make outcomes unpredictable regardless of how well you play. Abstract strategy games remove all of that. The result is a different kind of experience.
        </p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Every Loss Is Fixable</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            In a dice game, you can play perfectly and lose. The feedback is noise. In Chess or Raichu, if you lose, a mistake caused it. You can find the mistake. You can understand it. You can not make it again.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            That feedback loop is the engine of improvement. Every game is a test, and every test has correct answers you can study afterward. Progress is real and traceable.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Skill Compounds</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            In luck-based games, a beginner can beat an expert on a good day. In zero-luck games, a significantly stronger player wins close to 100% of the time. This means skill is real and durable.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            The skills also transfer. Pattern recognition, planning several moves ahead, calculating material trades, managing threats: these thinking patterns carry from Chess to Go to Raichu and back. Time invested in one game makes you better at all of them.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>No Expansion Packs</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Chess has not changed in a meaningful way since the 15th century. Go has been played in the same form for over a thousand years. The game you learn today is the same game you will play in twenty years.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            No power creep. No meta shifts from new card sets. No version updates that obsolete what you learned. The investment in learning is permanent.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>The Depth Never Bottoms Out</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Tic-tac-toe is a zero-luck game, but it is solved: both players playing correctly always draw. Chess and Go are not solved at human level. Neither is Raichu. The practical depth is effectively unlimited.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            At every skill level, there is a meaningful opponent above you. The game stays interesting as long as you do.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Where to Start</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            If you have not played an abstract strategy game seriously, start with a short one. Raichu takes five minutes to learn and fifteen minutes to play. The hierarchy of three pieces is simple enough that you can focus on thinking rather than memorizing rules. From there, move to Chess, then Go.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"                      style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu Free</Link>
          <Link href="/blog/board-games-no-luck"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Games With No Luck</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
