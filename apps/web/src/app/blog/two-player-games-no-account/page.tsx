import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Two Player Games With No Account Required | Play Instantly',
  description: 'Strategy games you can play with two players instantly, no account needed: Raichu, Lichess, and more. Open a browser and start playing in under 30 seconds.',
  path:        '/blog/two-player-games-no-account',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Two Player Games With No Account Required',
  description:'Strategy games playable for two players instantly, without creating an account.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  datePublished: '2026-05-12',
  dateModified:  '2026-05-12',
  image:         `${SITE_URL}/opengraph-image`,
  mainEntityOfPage: `${SITE_URL}/blog/two-player-games-no-account`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Two Player Games No Account', item: `${SITE_URL}/blog/two-player-games-no-account` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

const OPTIONS = [
  {
    name: 'Raichu — Local PvP',
    how: 'Go to /play, select PvP mode. Both players use the same screen, passing the device or sitting across from each other.',
    time: '0 seconds to start',
  },
  {
    name: 'Raichu — vs AI',
    how: 'Go to /play, select vs AI. Play against the computer immediately. No login, no setup.',
    time: '0 seconds to start',
  },
  {
    name: 'Lichess — vs AI',
    how: 'Visit lichess.org. Click Play with the computer. Choose difficulty. Start immediately.',
    time: '0 seconds to start',
  },
  {
    name: 'Lichess — Challenge a Friend',
    how: 'Click Create a game, choose "Invite a friend," copy the link. Your friend opens the link and the game begins. Neither player needs an account.',
    time: '30 seconds to share the link',
  },
  {
    name: 'Pychess — Chess Variants',
    how: 'Visit pychess.org. Create a game with a friend link. Works the same way as Lichess but covers more variants.',
    time: '30 seconds to share the link',
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
        <span>Two Player Games No Account</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Two Player Games With No Account Required
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Creating an account to play a game is friction. Sometimes you want to play in the next 30 seconds. These are the fastest paths to a two-player strategy game with no registration required.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Options</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {OPTIONS.map(({ name, how, time }) => (
              <div key={name} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--c-text)', margin: 0 }}>{name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--c-green)', backgroundColor: 'var(--c-green)22', padding: '0.15rem 0.5rem', borderRadius: 4 }}>{time}</span>
                </div>
                <p style={{ color: 'var(--c-muted)', lineHeight: 1.65, fontSize: '0.9375rem', margin: 0 }}>{how}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>When You Do Want an Account</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            An account is useful when you want to track your ELO rating, see your game history, and find rated matches against players at your level. Raichu supports ranked play with account-based ELO tracking. But none of that is required for your first game.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Now, No Account</Link>
          <Link href="/lobby" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Online Lobby</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
