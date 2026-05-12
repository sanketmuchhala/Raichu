'use client';

import Link from 'next/link';
import { useUIStore } from '../store/ui-store';
import { THEMES } from '../lib/themes';
import { UserMenu } from '../components/auth/UserMenu';

const CDN = 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150';
const P   = (c: string) => `${CDN}/${c}.png`;

const GAME_SCHEMA = {
  '@context':           'https://schema.org',
  '@type':              'VideoGame',
  name:                 'Raichu Game',
  description:          'A chess-inspired abstract strategy game playable free in the browser. Capture all opponent pieces to win.',
  genre:                'Abstract strategy game',
  gamePlatform:         'Web Browser',
  applicationCategory:  'Game',
  playMode:             ['SinglePlayer', 'MultiPlayer'],
  operatingSystem:      'Any',
  url:                  'https://raichu.live',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function Home() {
  const theme  = useUIStore((s) => THEMES[s.theme]);

  return (
    <div
      className="lp"
      style={{ backgroundColor: theme.bgPrimary, color: theme.textPrimary }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(GAME_SCHEMA) }} />
      {/* ── Nav ──────────────────────────────────────── */}
      <header
        className="lp-nav"
        style={{ borderBottom: `1px solid ${theme.border}` }}
      >
        <Link
          href="/"
          className="lp-nav-logo"
          style={{ color: theme.textPrimary }}
        >
          Raichu
        </Link>

        <nav className="lp-nav-links">
          <Link href="/rules"       className="lp-nav-link" style={{ color: theme.textSecondary }}>Rules</Link>
          <Link href="/leaderboard" className="lp-nav-link" style={{ color: theme.textSecondary }}>Leaderboard</Link>
          <Link href="/puzzles"     className="lp-nav-link" style={{ color: theme.textSecondary }}>Puzzles</Link>
          <UserMenu />
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="lp-hero">

        {/* Pieces */}
        <div
          className="r1"
          style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', marginBottom: '2.5rem' }}
        >
          {[
            { code: 'bp', size: 52 },
            { code: 'br', size: 64 },
            { code: 'bq', size: 80 },
            { code: 'wq', size: 80 },
            { code: 'wr', size: 64 },
            { code: 'wp', size: 52 },
          ].map(({ code, size }) => (
            <img
              key={code}
              src={P(code)}
              width={size}
              height={size}
              alt=""
              draggable={false}
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
            />
          ))}
        </div>

        {/* Wordmark */}
        <h1
          className="r2"
          style={{
            fontSize: 'clamp(3rem, 10vw, 5.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: '0.875rem',
          }}
        >
          Raichu
        </h1>

        <p
          className="r3"
          style={{
            fontSize: '1rem',
            color: theme.textSecondary,
            marginBottom: '2.25rem',
            maxWidth: '40ch',
            lineHeight: 1.6,
          }}
        >
          A strategy board game with three piece types.
          Capture every opponent piece to win.
        </p>

        {/* CTAs */}
        <div
          className="r4"
          style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}
        >
          <Link
            href="/play"
            className="lp-btn lp-btn-primary"
            style={{ backgroundColor: theme.accent }}
          >
            Play vs AI
          </Link>
          <Link
            href="/lobby"
            className="lp-btn lp-btn-ghost"
            style={{
              color: theme.textPrimary,
              border: `1px solid ${theme.border}`,
            }}
          >
            Play Online
          </Link>
        </div>

        {/* Utility links */}
        <nav
          className="r5"
          style={{ display: 'flex', gap: '1.75rem' }}
        >
          {[
            { href: '/rules',       label: 'How to Play' },
            { href: '/puzzles',     label: 'Puzzles'     },
            { href: '/leaderboard', label: 'Leaderboard' },
            { href: '/history',     label: 'History'     },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{ fontSize: '0.8125rem', color: theme.textSecondary, textDecoration: 'none' }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </section>

      {/* ── Piece Guide ──────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${theme.border}`, maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <div style={{ padding: '3rem 2rem 1.5rem', textAlign: 'center' }}>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: theme.textSecondary,
            }}
          >
            The Pieces
          </h2>
        </div>

        <div
          className="lp-cards"
          style={{ borderTop: `1px solid ${theme.border}`, marginBottom: '2rem' }}
        >
          {PIECES.map((p, i) => (
            <div
              key={p.name}
              className="lp-card"
              style={{
                backgroundColor: theme.bgPanel,
                borderRight: i < PIECES.length - 1 ? `1px solid ${theme.border}` : undefined,
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <img src={P(p.wCode)} width={48} height={48} alt="" draggable={false} />
                <img src={P(p.bCode)} width={48} height={48} alt="" draggable={false} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: theme.textPrimary }}>
                {p.name}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: theme.accent,
                }}
              >
                {p.role}
              </div>
              <p style={{ fontSize: '0.8125rem', color: theme.textSecondary, lineHeight: 1.6, maxWidth: '28ch' }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What is Raichu ───────────────────────────── */}
      <section style={{ borderTop: `1px solid ${theme.border}`, maxWidth: 900, margin: '0 auto', width: '100%', padding: '3rem 2rem' }}>
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>

          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: '0.75rem' }}>
              What is Raichu?
            </h2>
            <p style={{ fontSize: '0.875rem', color: theme.textSecondary, lineHeight: 1.75 }}>
              Raichu is a two-player abstract strategy game played on an 8×8 board. Chess-inspired in spirit: piece hierarchy, promotion, no luck, no draws. But it has its own complete ruleset and win condition. Capture every enemy piece to win.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: '0.75rem' }}>
              Why chess players like it
            </h2>
            <ul style={{ fontSize: '0.875rem', color: theme.textSecondary, lineHeight: 1.8, paddingLeft: '1.25rem', margin: 0 }}>
              <li>Zero luck. Outcomes depend entirely on decision quality</li>
              <li>Deep tactics from a simple ruleset</li>
              <li>Games finish in 5–15 minutes, no drawn-out endings</li>
              <li>Promotion pressure creates chess-like middlegame tension</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: '0.75rem' }}>
              How it differs from chess
            </h2>
            <ul style={{ fontSize: '0.875rem', color: theme.textSecondary, lineHeight: 1.8, paddingLeft: '1.25rem', margin: 0 }}>
              <li>No king. Win by capturing every piece</li>
              <li>Capture hierarchy limits which pieces can take which</li>
              <li>Jump-style captures (like checkers), not displacement</li>
              <li>No draws, no en passant, no castling</li>
            </ul>
          </div>

        </div>
        <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/raichu-vs-chess" style={{ fontSize: '0.8125rem', fontWeight: 600, color: theme.accent, textDecoration: 'none' }}>Raichu vs Chess in detail →</Link>
          <Link href="/how-to-play"     style={{ fontSize: '0.8125rem', fontWeight: 600, color: theme.accent, textDecoration: 'none' }}>Beginner guide →</Link>
          <Link href="/strategy"        style={{ fontSize: '0.8125rem', fontWeight: 600, color: theme.accent, textDecoration: 'none' }}>Strategy tips →</Link>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────── */}
      <section
        style={{
          padding: '3rem 2rem 5rem',
          textAlign: 'center',
          borderTop: `1px solid ${theme.border}`,
        }}
      >
        <p style={{ color: theme.textSecondary, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          White moves first. Capture all enemy pieces to win. No draws.
        </p>
        <Link
          href="/rules"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: theme.accent,
            textDecoration: 'none',
          }}
        >
          Read the full rules →
        </Link>
      </section>

      {/* ── SEO nav links ────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${theme.border}`, padding: '2rem', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', justifyContent: 'center' }}>
          {[
            { group: 'Play',    links: [['/play','Play Now'],['/rules','Rules'],['/how-to-play','How to Play']] },
            { group: 'Learn',   links: [['/strategy','Strategy Guide'],['/blog','Blog'],['/faq','FAQ']] },
            { group: 'Explore', links: [['/chess-like-games','Chess-Like Games'],['/chess-variants','Chess Variants'],['/raichu-vs-chess','Raichu vs Chess']] },
          ].map(({ group, links }) => (
            <div key={group}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: '0.5rem' }}>{group}</p>
              {links.map(([href, label]) => (
                <div key={href} style={{ marginBottom: '0.25rem' }}>
                  <Link href={href} style={{ fontSize: '0.8125rem', color: theme.textSecondary, textDecoration: 'none' }}>{label}</Link>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer
        style={{
          padding: '1.25rem 2rem',
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '0.8125rem', color: theme.textSecondary }}>
          © 2026 Sanket Muchhala
        </span>
        <span style={{ color: theme.border }}>·</span>
        <a
          href="https://github.com/sanketmuchhala"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.8125rem', color: theme.textSecondary, textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = theme.textPrimary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = theme.textSecondary)}
        >
          GitHub
        </a>
        <span style={{ color: theme.border }}>·</span>
        <a
          href="https://github.com/sanketmuchhala/Raichu"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.8125rem', color: theme.textSecondary, textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = theme.textPrimary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = theme.textSecondary)}
        >
          View Source
        </a>
      </footer>
    </div>
  );
}

const PIECES = [
  { wCode:'wp', bCode:'bp', name:'Pichu',   role:'Pawn',
    desc:'Moves one square diagonally forward. Can only capture other Pichus.' },
  { wCode:'wr', bCode:'br', name:'Pikachu', role:'Rook',
    desc:'Moves 1–2 squares forward or sideways. Captures Pichus and Pikachus.' },
  { wCode:'wq', bCode:'bq', name:'Raichu',  role:'Queen',
    desc:'Moves any direction, any distance. Captures any piece. Earned through promotion.' },
];
