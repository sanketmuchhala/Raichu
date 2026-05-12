'use client';

import Link from 'next/link';
import { useUIStore } from '../store/ui-store';
import { THEMES } from '../lib/themes';
import { UserMenu } from '../components/auth/UserMenu';

const CDN = 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150';
const P   = (c: string) => `${CDN}/${c}.png`;

export default function Home() {
  const theme  = useUIStore((s) => THEMES[s.theme]);

  return (
    <div
      className="lp"
      style={{ backgroundColor: theme.bgPrimary, color: theme.textPrimary }}
    >
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
