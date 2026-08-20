import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../lib/seo';
import { SchemaScript } from '../../components/seo/SchemaScript';
import { SeoFooter } from '../../components/seo/SeoFooter';
import { Navbar } from '../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Raichu Strategy Guide | Tactics, Openings, and Winning Tips',
  description: 'Master Raichu with this strategy guide. Covers opening principles, board control, tempo, tactical patterns, piece coordination, and endgame technique.',
  path:        '/strategy',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Raichu Strategy Guide',
  description:'Opening principles, board control, tactics, and endgame ideas for the Raichu abstract strategy game.',
  author: { '@type': 'Organization', name: 'Raichu Game' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',     item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Strategy', item: `${SITE_URL}/strategy` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;
const h3Style = { fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.375rem', color: 'var(--c-green)' } as const;
const paraStyle = { color: 'var(--c-muted)', lineHeight: 1.75, marginBottom: '1rem' } as const;

export default function StrategyPage() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 860, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>
        {' / '}
        <span>Strategy</span>
      </nav>

      <article style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem' }}>
          Raichu Strategy Guide
        </h1>
        <p style={{ color: 'var(--c-muted)', marginBottom: '2.5rem', fontSize: '1.0625rem' }}>
          Tactical patterns, opening principles, and endgame ideas for players who want to win more consistently.
        </p>

        {/* Opening */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Opening Principles</h2>

          <h3 style={h3Style}>Control the center diagonals with Pichus</h3>
          <p style={paraStyle}>
            Pichus that reach the center of the board threaten captures in multiple directions and are harder to dislodge. On the first few moves, advance Pichus toward the middle rather than the edges. An edge Pichu has fewer capture options and is easier to ignore.
          </p>

          <h3 style={h3Style}>Develop Pikachus early</h3>
          <p style={paraStyle}>
            Pikachus are your primary offensive tools before any promotions happen. Each Pikachu controls up to three directions simultaneously. Get them into active squares in the first five moves. A Pikachu on the fourth rank is far more threatening than one stuck on the first.
          </p>

          <h3 style={h3Style}>Avoid unnecessary captures early</h3>
          <p style={paraStyle}>
            An early capture that opens a file for the opponent can backfire. Before taking, check whether the recapture leaves the opponent in a stronger position. Sometimes the best move is quiet development, not a trade.
          </p>
        </section>

        {/* Board control */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Board Control</h2>

          <h3 style={h3Style}>The center is everything</h3>
          <p style={paraStyle}>
            A piece in the center can reach more squares and threaten more captures than one sitting on the edge. Pikachus and Raichus in central positions exert pressure across the whole board. Aim to control rows 4 and 5 with active pieces.
          </p>

          <h3 style={h3Style}>Create promotion lanes</h3>
          <p style={paraStyle}>
            The fastest path to a Raichu is a Pichu or Pikachu with a clear lane to the back row. When you have two or three pieces converging on the same lane, the opponent must react or face a devastating promotion. Building promotion pressure forces them to play defensively.
          </p>
        </section>

        {/* Tempo */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Tempo and Forcing Moves</h2>

          <h3 style={h3Style}>Make threats that demand a response</h3>
          <p style={paraStyle}>
            A <em>forcing move</em> is one that leaves the opponent with no good answer: a capture threat, a promotion threat, or a fork (attacking two pieces at once). When you string forcing moves together, your opponent must react rather than develop, and you steadily gain the initiative.
          </p>

          <h3 style={h3Style}>The fork with Raichu</h3>
          <p style={paraStyle}>
            A promoted Raichu that simultaneously threatens two enemy pieces is a game-defining tactic. Because Raichus capture in all 8 directions, placing one on a square that attacks two targets from different angles forces a material loss. Look for these fork opportunities whenever you promote.
          </p>

          <h3 style={h3Style}>Tempo counts. do not waste moves</h3>
          <p style={paraStyle}>
            Every move that does not advance your position hands tempo to the opponent. Avoid retreating pieces unless necessary. Moving the same piece twice in the opening without a concrete reason is usually a mistake.
          </p>
        </section>

        {/* Piece safety */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Piece Safety</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {[
              { piece: 'Pichu', note: 'Expendable, but each loss matters. Losing a Pichu without gaining a promotion threat or capture is a mistake.' },
              { piece: 'Pikachu', note: 'Your core attacking unit. Losing both Pikachus before promoting anything leaves you severely disadvantaged.' },
              { piece: 'Raichu', note: 'Winning. Protect promoted Raichus: the opponent\'s Raichus can capture yours. Two Raichus should be nearly unstoppable.' },
            ].map(({ piece, note }) => (
              <div key={piece} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderLeft: '3px solid var(--c-green)', borderRadius: 10, padding: '1rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.375rem' }}>{piece}</div>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Endgame */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Endgame Ideas</h2>

          <h3 style={h3Style}>Two Raichus win</h3>
          <p style={paraStyle}>
            If you have two Raichus and the opponent has only Pichus and Pikachus, the game is effectively over. Use one Raichu to cut off escape routes while the second captures. Coordinate rather than rush: a methodical approach eliminates the risk of a blunder.
          </p>

          <h3 style={h3Style}>Minority endgames</h3>
          <p style={paraStyle}>
            If the material is close, promotion becomes critical. A single Pichu that reaches the back row can flip the game. In tight endgames, advance your most advanced piece while using other pieces to shield its path.
          </p>

          <h3 style={h3Style}>Trapping pieces</h3>
          <p style={paraStyle}>
            Raichus can box in enemy pieces. If an opponent's Pikachu is on the edge of the board with friendly pieces blocking its path forward and a Raichu covering all retreat squares, it is effectively dead. Recognizing these trapping patterns converts winning positions without risky captures.
          </p>
        </section>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: '0.9375rem' }}>
            Apply It. Play Now
          </Link>
          <Link href="/rules" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: '0.9375rem' }}>
            Rules Reference
          </Link>
          <Link href="/how-to-play" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: '0.9375rem' }}>
            Beginner Guide
          </Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
