import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../lib/seo';
import { SchemaScript } from '../../components/seo/SchemaScript';
import { SeoFooter } from '../../components/seo/SeoFooter';
import { Navbar } from '../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'How to Play Raichu | Beginner Guide and Strategy Basics',
  description: 'Learn how to play Raichu step by step. Covers board setup, piece movement, captures, promotion, first-move advice, and beginner tips.',
  path:        '/how-to-play',
});

const howToSchema = {
  '@context': 'https://schema.org',
  '@type':    'HowTo',
  name:       'How to Play Raichu',
  description:'Step-by-step guide to learning the Raichu abstract strategy board game.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Set up the board',        text: 'Each player places 4 Pikachus on alternating squares of their first row and 4 Pichus on alternating squares of their second row. The four center rows start empty.' },
    { '@type': 'HowToStep', position: 2, name: 'Know your pieces',        text: 'Pichu moves one square diagonally forward. Pikachu moves 1–2 squares forward, left, or right. Raichu moves any direction any distance.' },
    { '@type': 'HowToStep', position: 3, name: 'White moves first',       text: 'White always takes the first turn. On each turn you move exactly one piece.' },
    { '@type': 'HowToStep', position: 4, name: 'Capture enemy pieces',    text: 'Capture by jumping over an adjacent enemy piece to the empty square beyond it. Pichu captures Pichus only. Pikachu captures Pichus and Pikachus. Raichu captures anything.' },
    { '@type': 'HowToStep', position: 5, name: 'Promote to Raichu',       text: 'When a Pichu or Pikachu reaches the opponent\'s back row it immediately promotes to a Raichu, the most powerful piece.' },
    { '@type': 'HowToStep', position: 6, name: 'Win the game',            text: 'Capture every one of your opponent\'s pieces. There are no draws in Raichu, every game has a winner.' },
  ],
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'How to Play', item: `${SITE_URL}/how-to-play` },
    ],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type':    'FAQPage',
  mainEntity: [
    {
      '@type':          'Question',
      name:             'How do you win in Raichu?',
      acceptedAnswer: { '@type': 'Answer', text: 'Capture every one of your opponent\'s pieces. Unlike chess there is no king, you must eliminate the entire army.' },
    },
    {
      '@type':          'Question',
      name:             'Can pieces move backward in Raichu?',
      acceptedAnswer: { '@type': 'Answer', text: 'Only Raichus can move in any direction. Pichus only move diagonally forward and Pikachus only move forward or sideways.' },
    },
    {
      '@type':          'Question',
      name:             'Is Raichu easy to learn?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The rules fit on one page. Most new players are making meaningful tactical decisions within their first game.' },
    },
  ],
};

export default function HowToPlayPage() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100dvh' }}>
      <SchemaScript schema={howToSchema} />
      <SchemaScript schema={faqSchema} />

      <Navbar />

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" style={{ maxWidth: 860, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>
        {' / '}
        <span>How to Play</span>
      </nav>

      <article style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem' }}>
          How to Play Raichu
        </h1>
        <p style={{ color: 'var(--c-muted)', marginBottom: '2.5rem', fontSize: '1.0625rem' }}>
          A step-by-step beginner guide to the chess-inspired abstract strategy game.
        </p>

        {/* Step-by-step */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' }}>
            Step-by-Step Guide
          </h2>

          {[
            {
              n: 1,
              title: 'Set Up the Board',
              body: 'Raichu is played on a standard 8×8 board. Each player starts with eight pieces: four Pikachus on alternating squares of their first row, and four Pichus on alternating squares of their second row. The four center rows are empty. White occupies rows 1–2 (top), Black occupies rows 7–8 (bottom).',
            },
            {
              n: 2,
              title: 'Learn Your Three Piece Types',
              body: null,
              list: [
                '<strong>Pichu</strong>: moves one square diagonally forward. Captures by jumping over an adjacent enemy Pichu, landing on the empty square beyond. Can only capture other Pichus.',
                '<strong>Pikachu</strong>: moves 1 or 2 squares forward, left, or right (no diagonal, no backward). Captures Pichus and other Pikachus by jumping over them.',
                '<strong>Raichu</strong>: moves any number of squares in any of the 8 directions. Captures any piece by jumping over it and can land anywhere along the line beyond it. Earned through promotion.',
              ],
            },
            {
              n: 3,
              title: 'White Moves First',
              body: 'White always takes the first turn. Players alternate turns. On each turn you move exactly one piece: either a quiet move to an empty square or a capture.',
            },
            {
              n: 4,
              title: 'Captures Are Optional',
              body: 'Unlike checkers, captures are not mandatory. You may always choose any legal move on your turn. There is no chain capturing, one capture per move.',
            },
            {
              n: 5,
              title: 'Promote to Raichu',
              body: 'When a Pichu or Pikachu reaches the opponent\'s back row (row 8 for White, row 1 for Black), it immediately promotes to a Raichu. Promotion is automatic at the end of the move.',
            },
            {
              n: 6,
              title: 'Win by Capturing Everything',
              body: 'The game ends when one player has no pieces remaining. Capture every enemy piece to win. There are no draws in Raichu.',
            },
          ].map((step) => (
            <div key={step.n} style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem' }}>
              <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--c-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', marginTop: 2 }}>
                {step.n}
              </span>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.375rem' }}>{step.title}</h3>
                {step.body && <p style={{ color: 'var(--c-muted)', lineHeight: 1.7 }}>{step.body}</p>}
                {step.list && (
                  <ul style={{ color: 'var(--c-muted)', lineHeight: 1.8, paddingLeft: '1.25rem', marginTop: '0.375rem' }}>
                    {step.list.map((item, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* First move advice */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' }}>
            First-Move Advice
          </h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {[
              { tip: 'Move a Pichu forward', why: 'Pichus control center diagonals. Early Pichu development creates capture threats and opens lanes for Pikachus.' },
              { tip: 'Develop Pikachus early', why: 'Pikachus cover ranks and files. Getting them into active positions early puts tactical pressure on the opponent.' },
              { tip: 'Protect your Pikachus', why: 'Pikachus are your main attacking pieces before promotion. Losing one early without compensation is costly.' },
            ].map((item) => (
              <div key={item.tip} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--c-green)', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>{item.tip}</div>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.875rem', lineHeight: 1.65 }}>{item.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Common mistakes */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' }}>
            Common Beginner Mistakes
          </h2>
          <ul style={{ color: 'var(--c-muted)', lineHeight: 1.9, paddingLeft: '1.5rem' }}>
            <li><strong style={{ color: 'var(--c-text)' }}>Forgetting Pichu can only capture Pichus.</strong> A Pichu adjacent to an enemy Pikachu cannot capture it. it can only threaten Pichus.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Ignoring promotion threats.</strong> A Pichu or Pikachu two squares from the back row is a serious threat. Defend or counter immediately.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Moving Pikachus sideways without a plan.</strong> Pikachus can move left and right, but aimless lateral movement wastes tempo.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Forgetting captures are optional.</strong> Sometimes the best move is a quiet development, not an available capture.</li>
            <li><strong style={{ color: 'var(--c-text)' }}>Leaving promoted Raichus unprotected.</strong> A Raichu can capture anything, but so can the opponent's Raichus.</li>
          </ul>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.625rem', borderBottom: '2px solid var(--c-border)' }}>
            Quick FAQ
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { q: 'How do you win?',                   a: 'Capture every one of your opponent\'s pieces. There is no king to checkmate, you must eliminate the entire army.' },
              { q: 'Can pieces move backward?',          a: 'Only Raichus. Pichus always move diagonally forward. Pikachus move forward, left, or right, never backward.' },
              { q: 'Is Raichu hard to learn?',           a: 'No. The rules fit on one page and most beginners are thinking tactically from the very first game.' },
              { q: 'How long does a game take?',         a: 'Typically 5–15 minutes. Games are shorter than chess because there is no drawn-out endgame. Once one side loses piece count advantage, the end comes quickly.' },
            ].map(({ q, a }) => (
              <div key={q} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1rem 1.25rem' }}>
                <dt style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{q}</dt>
                <dd style={{ color: 'var(--c-muted)', lineHeight: 1.65, margin: 0 }}>{a}</dd>
              </div>
            ))}
          </div>
        </section>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: '0.9375rem' }}>
            Play Now
          </Link>
          <Link href="/rules" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: '0.9375rem' }}>
            Full Rules
          </Link>
          <Link href="/strategy" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: '0.9375rem' }}>
            Strategy Guide
          </Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
