import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../lib/seo';
import { SchemaScript } from '../../components/seo/SchemaScript';
import { SeoFooter } from '../../components/seo/SeoFooter';
import { Navbar } from '../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Raichu vs Chess | Similarities, Differences, and Strategy',
  description: 'How does Raichu compare to chess? Both use a piece hierarchy and tactical positional play. Raichu has simpler rules, a different win condition, and faster games.',
  path:        '/raichu-vs-chess',
  type:        'article',
});

const schema = {
  '@context': 'https://schema.org',
  '@type':    'Article',
  headline:   'Raichu vs Chess: Similarities, Differences, and Strategy',
  description:'A detailed comparison between Raichu and chess covering rules, strategy, learning curve, and who should play each game.',
  author: { '@type': 'Organization', name: 'Raichu Game' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',           item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Raichu vs Chess', item: `${SITE_URL}/raichu-vs-chess` },
    ],
  },
};

const h2Style = { fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' } as const;

export default function RaichuVsChessPage() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={schema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 860, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>
        {' / '}
        <span>Raichu vs Chess</span>
      </nav>

      <article style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem' }}>
          Raichu vs Chess
        </h1>
        <p style={{ color: 'var(--c-muted)', marginBottom: '2.5rem', fontSize: '1.0625rem' }}>
          Both games reward tactical thinking and positional play on an 8×8 board. Here is how they compare.
        </p>

        {/* Comparison table */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>At a Glance</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--c-border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.625rem 1rem', color: 'var(--c-muted)', fontWeight: 600 }}>Feature</th>
                  <th style={{ textAlign: 'left', padding: '0.625rem 1rem', color: 'var(--c-green)', fontWeight: 700 }}>Raichu</th>
                  <th style={{ textAlign: 'left', padding: '0.625rem 1rem', color: 'var(--c-muted)', fontWeight: 600 }}>Chess</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Board',            '8×8',                               '8×8'],
                  ['Starting pieces',  '8 per side (4 Pikachus, 4 Pichus)', '16 per side (various types)'],
                  ['Win condition',    'Capture all enemy pieces',          'Checkmate the king'],
                  ['No luck',         'Yes',                               'Yes'],
                  ['Special moves',    'Promotion',                         'Promotion, castling, en passant'],
                  ['Draws possible',   'No',                               'Yes (stalemate, repetition, 50-move, agreement)'],
                  ['Average game',     '5–15 minutes',                     '10–60 minutes'],
                  ['Learning time',    '~10 minutes',                      '~1 hour for basics'],
                  ['Depth ceiling',    'High',                             'Extremely high'],
                  ['Browser play',     'Free, no install',                 'Many sites; varies'],
                ].map(([feature, raichu, chess], i) => (
                  <tr key={feature} style={{ borderBottom: '1px solid var(--c-border)', backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--c-bg-1)' }}>
                    <td style={{ padding: '0.625rem 1rem', fontWeight: 600 }}>{feature}</td>
                    <td style={{ padding: '0.625rem 1rem', color: 'var(--c-muted)' }}>{raichu}</td>
                    <td style={{ padding: '0.625rem 1rem', color: 'var(--c-muted)' }}>{chess}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Similarities */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Similarities</h2>
          <ul style={{ color: 'var(--c-muted)', lineHeight: 1.9, paddingLeft: '1.5rem' }}>
            <li><strong style={{ color: 'var(--c-text)' }}>8×8 board.</strong> Same spatial scale, so positional intuitions transfer.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Piece hierarchy.</strong> Weak pieces (Pichu/pawn) alongside powerful pieces (Raichu/queen), requiring different treatment.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Promotion mechanic.</strong> Advancing a weak piece to the back row earns a powerful piece. a central tactical goal in both games.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Board control.</strong> Controlling the center and creating threats in multiple directions rewards the same positional thinking.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Zero luck.</strong> Both are perfect-information games with no randomness. Outcomes depend entirely on decision quality.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Two-player, alternating turns.</strong> Same basic turn structure. White always moves first.</li>
          </ul>
        </section>

        {/* Differences */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Key Differences</h2>
          <ul style={{ color: 'var(--c-muted)', lineHeight: 1.9, paddingLeft: '1.5rem' }}>
            <li><strong style={{ color: 'var(--c-text)' }}>Win condition.</strong> Raichu: capture every enemy piece. Chess: checkmate the king. This changes the entire strategic calculus. in Raichu, every piece is equally important to defend.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Capture hierarchy.</strong> In Raichu, Pichus can only capture Pichus, Pikachus can only capture Pichus and Pikachus. In chess, any piece can take any piece.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Jump capture.</strong> Captures in Raichu are always jumps (the attacker lands beyond the target). In chess, the attacker moves to the target's square.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Fewer starting pieces.</strong> Eight per side vs. sixteen in chess. Games move faster and the tactical complexity ramps up sooner.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>No draws.</strong> Raichu always produces a winner. No stalemate, no 50-move rule, no threefold repetition.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Simpler ruleset.</strong> No castling, no en passant. Fewer special cases means fewer rules to memorize.</li>
          </ul>
        </section>

        {/* Who should play */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={h2Style}>Who Should Play Raichu</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {[
              { label: 'Chess players', text: 'Looking for a fresh tactical challenge with familiar ideas: piece hierarchy, promotion, board control, but a different win condition and no draws.' },
              { label: 'Strategy newcomers', text: 'Want chess-like depth but prefer a shorter learning curve. The rules take minutes to learn; the depth keeps experienced players engaged.' },
              { label: 'Casual players', text: 'Want a complete game in 5–15 minutes. Raichu\'s shorter game length makes it easy to fit into a break without a half-finished position.' },
            ].map(({ label, text }) => (
              <div key={label} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--c-green)', marginBottom: '0.375rem' }}>{label}</div>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"             style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Raichu Free</Link>
          <Link href="/chess-like-games" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>More Chess-Like Games</Link>
          <Link href="/rules"            style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Raichu Rules</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
