import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../../lib/seo';
import { SchemaScript } from '../../../components/seo/SchemaScript';
import { SeoFooter } from '../../../components/seo/SeoFooter';
import { Navbar } from '../../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Free Two Player Games Online: No Download Required',
  description: 'The best free two-player games you can play online right now: Raichu, Lichess, Board Game Arena, PlayStrategy, and more. No download, works in any browser.',
  path:        '/blog/free-two-player-games-online',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Free Two Player Games Online: No Download Required',
  description:'The best platforms and games for free two-player online play in a browser.',
  author:    { '@type': 'Organization', name: 'Raichu Game' },
  publisher: { '@type': 'Organization', name: 'Raichu Game', url: SITE_URL },
  datePublished: '2026-05-12',
  dateModified:  '2026-05-12',
  image:         `${SITE_URL}/opengraph-image`,
  mainEntityOfPage: `${SITE_URL}/blog/free-two-player-games-online`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: 'Free Two Player Games Online', item: `${SITE_URL}/blog/free-two-player-games-online` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

const PLATFORMS = [
  {
    name: 'Raichu (this site)',
    game: 'Raichu',
    account: 'Optional',
    note: 'Play vs AI or invite a friend instantly. No account needed for local play. Free online matchmaking with an account.',
  },
  {
    name: 'Lichess',
    game: 'Chess',
    account: 'Optional',
    note: 'Fully free, open-source chess. Create a challenge link and send it to anyone. No ads, no paywalls.',
  },
  {
    name: 'Board Game Arena',
    game: '500+ games',
    account: 'Required (free)',
    note: 'Free tier includes dozens of games including Hive, Onitama, Reversi, and many card games. Premium needed for some titles.',
  },
  {
    name: 'PlayStrategy',
    game: 'Chess variants, Go, Draughts',
    account: 'Optional',
    note: 'Open-source platform for abstract games. Covers Chess960, Shogi, Draughts, and more. Smaller community than Lichess but broader game selection.',
  },
  {
    name: 'Little Golem',
    game: 'Go, Chess, Hex, many others',
    account: 'Required (free)',
    note: 'Correspondence (turn-based over days) platform. Good for slower games. Not real-time.',
  },
];

export default function Article() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 720, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/"    style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>{' / '}
        <Link href="/blog" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Blog</Link>{' / '}
        <span>Free Two Player Games Online</span>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Free Two Player Games Online: No Download Required
        </h1>
        <p style={{ color: 'var(--c-muted)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          The best multiplayer strategy games are free and run entirely in a browser. No app store, no download, no $60 purchase. Here are the platforms worth knowing and what they offer.
        </p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Platforms</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {PLATFORMS.map(({ name, game, account, note }) => (
              <div key={name} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--c-text)', margin: 0 }}>{name}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)', backgroundColor: 'var(--c-bg-2)', padding: '0.15rem 0.5rem', borderRadius: 4 }}>{game}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)', backgroundColor: 'var(--c-bg-2)', padding: '0.15rem 0.5rem', borderRadius: 4 }}>{account}</span>
                  </div>
                </div>
                <p style={{ color: 'var(--c-muted)', lineHeight: 1.65, fontSize: '0.9375rem', margin: 0 }}>{note}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2Style}>Playing With a Remote Friend</h2>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
            All of these platforms support asynchronous or real-time play with someone who is not in the same room. The simplest flow for Raichu: create an account, start a friendly game from the lobby, and share the invite code. Your friend joins without needing an account.
          </p>
          <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>
            For chess, the Lichess challenge link flow is the cleanest: generate a challenge, send the link to your friend, they click it and the game starts. No account required on their end.
          </p>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/lobby" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu Online</Link>
          <Link href="/play"  style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Play vs AI</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
