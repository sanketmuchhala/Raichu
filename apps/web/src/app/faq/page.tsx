import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, SITE_URL } from '../../lib/seo';
import { SchemaScript } from '../../components/seo/SchemaScript';
import { SeoFooter } from '../../components/seo/SeoFooter';
import { Navbar } from '../../components/nav/Navbar';

export const metadata: Metadata = pageMetadata({
  title:       'Raichu Game FAQ | Frequently Asked Questions',
  description: 'Answers to common questions about Raichu: what it is, how to play, whether it is like chess, how to win, and where to learn strategy.',
  path:        '/faq',
});

const faqs = [
  {
    q: 'What is Raichu Game?',
    a: 'Raichu is a two-player abstract strategy board game played on an 8×8 board. Each player commands three piece types: Pichu, Pikachu, and Raichu, each with different movement and capture rules. The goal is to capture all of your opponent\'s pieces.',
  },
  {
    q: 'Is Raichu like chess?',
    a: 'Raichu is chess-inspired but not a chess variant. It shares the 8×8 board, a hierarchy of piece types, a promotion mechanic, and tactical positional depth. However, there is no king, no check or checkmate, no en passant or castling, and you win by capturing every enemy piece, not just the king.',
  },
  {
    q: 'Is Raichu free to play?',
    a: 'Yes. Raichu is completely free. No account is required to play against the AI. Create a free account to play online against other players and track your rating.',
  },
  {
    q: 'Can I play Raichu in the browser?',
    a: 'Yes. Raichu runs entirely in your browser. No download or installation is required. It works on desktop and mobile.',
  },
  {
    q: 'How do you win in Raichu?',
    a: 'You win by capturing every one of your opponent\'s pieces. Unlike chess, there is no king to checkmate. The game ends when one player has zero pieces remaining on the board.',
  },
  {
    q: 'Is Raichu a chess variant?',
    a: 'No. Raichu is a chess-inspired abstract strategy game, not a formal chess variant. Chess variants change or extend the rules of standard chess. Raichu is an independent game that draws on similar tactical concepts: piece hierarchy, promotion, board control, but has its own complete rule set.',
  },
  {
    q: 'Is Raichu beginner friendly?',
    a: 'Yes. The rules are simple enough to learn in one reading. The three piece types each have clear, intuitive movement patterns. Most beginners are making meaningful tactical decisions within their first game.',
  },
  {
    q: 'Does Raichu involve luck?',
    a: 'No. Raichu is a perfect-information, zero-luck abstract strategy game. Both players see the entire board at all times and there are no random elements. The outcome depends entirely on the quality of each player\'s decisions.',
  },
  {
    q: 'Can two players play Raichu?',
    a: 'Yes. Raichu supports local two-player mode (both players share one device), online play against another person (via the lobby), and single-player mode against an AI opponent at three difficulty levels.',
  },
  {
    q: 'Where can I learn Raichu strategy?',
    a: 'Start with the How to Play guide for the rules and first-move advice. The Strategy Guide covers opening principles, board control, tactical patterns, and endgame technique. Playing against the AI at increasing difficulty levels is the fastest way to improve.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type':    'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type':          'Question',
    name:             q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type':    'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'FAQ',  item: `${SITE_URL}/faq` },
  ],
};

export default function FaqPage() {
  return (
    <main style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '100vh' }}>
      <SchemaScript schema={faqSchema} />
      <SchemaScript schema={breadcrumbSchema} />
      <Navbar />

      <nav aria-label="breadcrumb" style={{ maxWidth: 860, margin: '1rem auto 0', padding: '0 1.5rem', fontSize: '0.8125rem', color: 'var(--c-muted)' }}>
        <Link href="/" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>Home</Link>
        {' / '}
        <span>FAQ</span>
      </nav>

      <article style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem' }}>
          Raichu Game FAQ
        </h1>
        <p style={{ color: 'var(--c-muted)', marginBottom: '2.5rem', fontSize: '1.0625rem' }}>
          Common questions about Raichu: what it is, how it works, and how to get started.
        </p>

        <dl style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map(({ q, a }) => (
            <div key={q} style={{ backgroundColor: 'var(--c-bg-1)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '1.25rem 1.5rem' }}>
              <dt style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{q}</dt>
              <dd style={{ color: 'var(--c-muted)', lineHeight: 1.75, margin: 0 }}>{a}</dd>
            </div>
          ))}
        </dl>

        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/play"        style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-green)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>Play Now</Link>
          <Link href="/how-to-play" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>How to Play</Link>
          <Link href="/rules"       style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Full Rules</Link>
          <Link href="/strategy"    style={{ display: 'inline-block', padding: '0.75rem 1.75rem', backgroundColor: 'var(--c-bg-1)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Strategy Guide</Link>
        </div>
      </article>

      <SeoFooter />
    </main>
  );
}
