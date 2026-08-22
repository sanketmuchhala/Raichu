'use client';

import Link from 'next/link';
import { useUIStore } from '../store/ui-store';
import { THEMES } from '../lib/themes';
import { SITE_URL } from '../lib/seo';
import { Navbar } from '../components/nav/Navbar';

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
  url:                  SITE_URL,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function Home() {
  const theme = useUIStore((s) => THEMES[s.theme]);

  return (
    <div
      className="lp"
      style={{ backgroundColor: theme.bgPrimary, color: theme.textPrimary }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(GAME_SCHEMA) }} />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="lp-hero">
        {/* Sizes are fluid: at 375px the fixed 52/64/80 widths totalled 452px
            inside a 311px box, so the outer pieces were clipped in half. */}
        <div
          className="r1 lp-hero-pieces"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 'clamp(0.25rem, 2vw, 0.75rem)',
            marginBottom: '2.5rem',
            width: '100%',
          }}
        >
          {[
            { code: 'bp', size: 'clamp(30px, 9vw, 52px)' },
            { code: 'br', size: 'clamp(37px, 11vw, 64px)' },
            { code: 'bq', size: 'clamp(46px, 14vw, 80px)' },
            { code: 'wq', size: 'clamp(46px, 14vw, 80px)' },
            { code: 'wr', size: 'clamp(37px, 11vw, 64px)' },
            { code: 'wp', size: 'clamp(30px, 9vw, 52px)' },
          ].map(({ code, size }) => (
            <img
              key={code}
              src={P(code)}
              alt=""
              draggable={false}
              style={{
                width: size,
                height: size,
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
              }}
            />
          ))}
        </div>

        <p className="r2 lp-hero-eyebrow" style={{ color: theme.accent }}>
          Fast games. Pure strategy.
        </p>

        <h1
          className="r2 lp-hero-title"
          style={{
            fontSize: 'clamp(3rem, 10vw, 5.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: '0.875rem',
          }}
        >
          Raichu
          <span className="lp-hero-hook">Think ahead. Take the board.</span>
        </h1>

        <p
          className="r3 lp-hero-copy"
          style={{
            fontSize: '1rem',
            color: theme.textSecondary,
            marginBottom: '2.25rem',
            maxWidth: '40ch',
            lineHeight: 1.6,
          }}
        >
          Learn three pieces, build a plan, and capture the opposition. No luck,
          no download, and no account required.
        </p>

        <div
          className="r4 lp-mode-launcher"
          style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}
        >
          <Link href="/play" className="lp-btn lp-btn-primary" style={{ backgroundColor: theme.accent }}>
            <span className="lp-mode-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="4" y="6" width="14" height="11" rx="3" stroke="currentColor" strokeWidth="1.7" />
                <path d="M8 6V4m6 2V4M8 11h.01M14 11h.01M8.5 14h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <span className="lp-mode-copy">
              <strong>Play vs computer</strong>
              <small>Start instantly</small>
            </span>
            <span className="lp-mode-arrow" aria-hidden="true">→</span>
          </Link>
          <Link href="/lobby" className="lp-btn lp-btn-ghost" style={{ color: theme.textPrimary, border: `1px solid ${theme.border}` }}>
            <span className="lp-mode-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="15.5" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.7" />
                <path d="M3.5 18c.5-3.1 2.1-4.7 4.8-4.7 2.6 0 4.2 1.6 4.7 4.7M13 14c2.9-.5 4.8.8 5.5 3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <span className="lp-mode-copy">
              <strong>Play online</strong>
              <small>Challenge real players</small>
            </span>
            <span className="lp-mode-arrow" aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="r5 lp-mobile-links">
          <Link href="/how-to-play" style={{ color: theme.textSecondary, borderColor: theme.border }}>
            <span aria-hidden="true">?</span>
            Learn in 2 minutes
          </Link>
          <Link href="/puzzles" style={{ color: theme.textSecondary, borderColor: theme.border }}>
            <span aria-hidden="true">♟</span>
            Solve puzzles
          </Link>
        </div>

        <nav
          className="r5 lp-hero-links"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 'clamp(0.75rem, 4vw, 1.75rem)',
          }}
        >
          {[
            { href: '/rules',       label: 'How to Play'  },
            { href: '/puzzles',     label: 'Puzzles'      },
            { href: '/leaderboard', label: 'Leaderboard'  },
            { href: '/history',     label: 'History'      },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{ fontSize: '0.8125rem', color: theme.textSecondary, textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </nav>
      </section>

      {/* ── Stats strip ──────────────────────────────── */}
      <section className="lp-stats-section" style={{ borderTop: `1px solid ${theme.border}`, width: '100%' }}>
        <div
          className="lp-stats"
          style={{
            maxWidth: 900,
            margin: '0 auto',
            display: 'grid',
            // 4 hard columns left ~62px of usable width per cell at 375px.
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          }}
        >
          {STATS.map(({ value, label }) => (
            <div
              className="lp-stat"
              key={label}
              style={{
                padding: 'clamp(1.25rem, 4vw, 2rem) 1rem',
                textAlign: 'center',
                // Outline rather than borderRight: the grid wraps on narrow
                // screens, which left a border dangling at the row end.
                outline: `1px solid ${theme.border}`,
                outlineOffset: -1,
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: theme.textPrimary,
                  lineHeight: 1,
                  marginBottom: '0.375rem',
                }}
              >
                {value}
              </div>
              <div style={{ fontSize: '0.75rem', color: theme.textSecondary, letterSpacing: '0.04em' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Piece Guide ──────────────────────────────── */}
      <section className="lp-piece-section" style={{ borderTop: `1px solid ${theme.border}`, maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <div className="lp-section-heading" style={{ padding: '3rem 2rem 1.5rem', textAlign: 'center' }}>
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
        <div className="lp-cards" style={{ borderTop: `1px solid ${theme.border}`, marginBottom: '2rem' }}>
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
              <div style={{ fontWeight: 700, fontSize: '1rem', color: theme.textPrimary }}>{p.name}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.accent }}>
                {p.role}
              </div>
              <p style={{ fontSize: '0.8125rem', color: theme.textSecondary, lineHeight: 1.6, maxWidth: '28ch' }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Capture Hierarchy ────────────────────────── */}
      <section style={{ borderTop: `1px solid ${theme.border}`, maxWidth: 900, margin: '0 auto', width: '100%', padding: 'clamp(2rem, 6vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textSecondary }}>
            Capture Hierarchy
          </h2>
          <span style={{ fontSize: '0.8125rem', color: theme.textSecondary }}>
            The rule that defines the game
          </span>
        </div>

        <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
          {HIERARCHY.map(({ name, wCode, bCode, canCapture, targetImages, note }, i) => (
            <div
              key={name}
              style={{
                display: 'grid',
                // The middle column is whiteSpace:nowrap, so it could not shrink;
                // three columns plus 48px of gaps did not fit a 375px screen.
                // Stack to one column below 640px.
                gridTemplateColumns: 'var(--hierarchy-cols, 1fr)',
                alignItems: 'center',
                padding: 'clamp(0.875rem, 3vw, 1.125rem) clamp(0.875rem, 3vw, 1.5rem)',
                gap: 'clamp(0.625rem, 2vw, 1.5rem)',
                backgroundColor: i % 2 === 0 ? theme.bgPanel : theme.bgPrimary,
                borderTop: i > 0 ? `1px solid ${theme.border}` : undefined,
              }}
            >
              {/* Piece identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <img src={P(wCode)} width={36} height={36} alt="" draggable={false} />
                  <img src={P(bCode)} width={36} height={36} alt="" draggable={false} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: theme.textPrimary }}>{name}</div>
                  <div style={{ fontSize: '0.75rem', color: theme.textSecondary, marginTop: '0.125rem' }}>{note}</div>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.textSecondary, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                <span style={{ color: theme.border }}>——</span>
                <span style={{ color: theme.accent, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.6875rem' }}>can capture</span>
                <span style={{ color: theme.border }}>——›</span>
              </div>

              {/* Targets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {targetImages.map((code) => (
                    <img key={code} src={P(code)} width={32} height={32} alt="" draggable={false} style={{ opacity: 0.9 }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.8125rem', color: theme.textSecondary }}>{canCapture}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What is Raichu ───────────────────────────── */}
      <section style={{ borderTop: `1px solid ${theme.border}`, maxWidth: 900, margin: '0 auto', width: '100%', padding: 'clamp(2rem, 6vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>
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

      {/* ── Game Modes ───────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${theme.border}`, maxWidth: 900, margin: '0 auto', width: '100%', padding: 'clamp(2rem, 6vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: '1.5rem', textAlign: 'center' }}>
          How you want to play
        </h2>
        <div className="lp-mode-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1px', border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
          {MODES.map(({ title, badge, desc, href, cta, primary }, i) => (
            <div
              key={title}
              className="lp-mode-card"
              style={{
                backgroundColor: theme.bgPanel,
                padding: '1.75rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
                borderRight: i < MODES.length - 1 ? `1px solid ${theme.border}` : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: theme.textPrimary }}>{title}</div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: theme.accent, backgroundColor: `${theme.accent}18`, padding: '0.1875rem 0.5rem', borderRadius: 4 }}>
                  {badge}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: theme.textSecondary, lineHeight: 1.65, flex: 1 }}>{desc}</p>
              <Link
                href={href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5625rem 1.25rem',
                  borderRadius: 6,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  marginTop: '0.25rem',
                  backgroundColor: primary ? theme.accent : 'transparent',
                  color: primary ? '#fff' : theme.textSecondary,
                  border: primary ? 'none' : `1px solid ${theme.border}`,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── How to play — 3 steps ────────────────────── */}
      <section style={{ borderTop: `1px solid ${theme.border}`, maxWidth: 900, margin: '0 auto', width: '100%', padding: 'clamp(2rem, 6vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: '2rem', textAlign: 'center' }}>
          Up and running in minutes
        </h2>
        <div className="lp-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0' }}>
          {STEPS.map(({ n, title, body, pieces }, i) => (
            <div
              key={n}
              className="lp-step"
              style={{
                padding: '1.75rem 1.5rem',
                borderRight: i < STEPS.length - 1 ? `1px solid ${theme.border}` : undefined,
                position: 'relative',
              }}
            >
              {/* Step number */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: `1.5px solid ${theme.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: theme.textSecondary,
                  marginBottom: '1.25rem',
                }}
              >
                {n}
              </div>

              {/* Piece visual */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.375rem', marginBottom: '1rem', minHeight: 52 }}>
                {pieces.map(({ code, size }) => (
                  <img key={code} src={P(code)} width={size} height={size} alt="" draggable={false} style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }} />
                ))}
              </div>

              <div style={{ fontWeight: 700, fontSize: '1rem', color: theme.textPrimary, marginBottom: '0.375rem' }}>{title}</div>
              <p style={{ fontSize: '0.8125rem', color: theme.textSecondary, lineHeight: 1.65 }}>{body}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link
            href="/how-to-play"
            style={{ fontSize: '0.875rem', fontWeight: 600, color: theme.accent, textDecoration: 'none' }}
          >
            Full beginner guide →
          </Link>
        </div>
      </section>

      {/* ── Learning resources ───────────────────────── */}
      <section style={{ borderTop: `1px solid ${theme.border}`, maxWidth: 900, margin: '0 auto', width: '100%', padding: 'clamp(2rem, 6vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: '1.5rem', textAlign: 'center' }}>
          Go deeper
        </h2>
        <div className="lp-resource-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
          {RESOURCES.map(({ label, title, desc, href }, i) => (
            <Link
              key={title}
              href={href}
              className="lp-resource-card"
              style={{
                display: 'block',
                backgroundColor: theme.bgPanel,
                padding: '1.5rem',
                textDecoration: 'none',
                borderRight: i < RESOURCES.length - 1 ? `1px solid ${theme.border}` : undefined,
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.bgSecondary)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.bgPanel)}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: theme.accent, marginBottom: '0.5rem' }}>
                {label}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: theme.textPrimary, marginBottom: '0.375rem' }}>{title}</div>
              <p style={{ fontSize: '0.8125rem', color: theme.textSecondary, lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${theme.border}`, padding: '4rem 2rem 5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.textSecondary, marginBottom: '1rem' }}>
          Ready to play?
        </p>
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: theme.textPrimary,
            marginBottom: '0.625rem',
            lineHeight: 1.15,
          }}
        >
          White moves first.
        </h2>
        <p style={{ color: theme.textSecondary, fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '36ch', margin: '0 auto 2rem' }}>
          Capture all enemy pieces to win. No draws, no luck — just tactics.
        </p>
        <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/play"  className="lp-btn lp-btn-primary" style={{ backgroundColor: theme.accent }}>Play Now</Link>
          <Link href="/rules" className="lp-btn lp-btn-ghost"   style={{ color: theme.textPrimary, border: `1px solid ${theme.border}` }}>Read the Rules</Link>
        </div>
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
        <span style={{ fontSize: '0.8125rem', color: theme.textSecondary }}>© 2026 Sanket Muchhala</span>
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

/* ── Data ──────────────────────────────────────────────── */

const PIECES = [
  { wCode: 'wp', bCode: 'bp', name: 'Pichu',   role: 'Pawn',
    desc: 'Moves one square diagonally forward. Can only capture other Pichus.' },
  { wCode: 'wr', bCode: 'br', name: 'Pikachu', role: 'Rook',
    desc: 'Moves 1–2 squares forward or sideways. Captures Pichus and Pikachus.' },
  { wCode: 'wq', bCode: 'bq', name: 'Raichu',  role: 'Queen',
    desc: 'Moves any direction, any distance. Captures any piece. Earned through promotion.' },
];

const STATS = [
  { value: '5–15',  label: 'minutes per game'   },
  { value: '0',     label: 'luck involved'       },
  { value: '3',     label: 'piece types to learn' },
  { value: 'Free',  label: 'no account needed'   },
];

const HIERARCHY = [
  {
    name: 'Pichu',
    wCode: 'wp', bCode: 'bp',
    canCapture: 'Pichu only',
    targetImages: ['bp', 'wp'],
    note: 'The foot soldier. Cheap but expendable.',
  },
  {
    name: 'Pikachu',
    wCode: 'wr', bCode: 'br',
    canCapture: 'Pichu and Pikachu',
    targetImages: ['bp', 'br'],
    note: 'Your main attacker. Cannot threaten Raichus.',
  },
  {
    name: 'Raichu',
    wCode: 'wq', bCode: 'bq',
    canCapture: 'Any piece',
    targetImages: ['bp', 'br', 'bq'],
    note: 'Earned by promotion. Dominates the board.',
  },
];

const MODES = [
  {
    title:   'Play vs AI',
    badge:   'Solo',
    desc:    'Three difficulty levels. The engine runs entirely in your browser — instant response, no server wait.',
    href:    '/play',
    cta:     'Start Game',
    primary: true,
  },
  {
    title:   'Play Online',
    badge:   'Ranked',
    desc:    'ELO-rated matchmaking against real players. Track your rating and climb the leaderboard.',
    href:    '/lobby',
    cta:     'Find Match',
    primary: false,
  },
  {
    title:   'Local PvP',
    badge:   'Two players',
    desc:    'Pass and play on the same device. No accounts, no setup — just open the board and go.',
    href:    '/play?mode=pvp',
    cta:     'Play Now',
    primary: false,
  },
];

const STEPS = [
  {
    n: 1,
    title: 'Set up and move',
    body: 'White moves first. Move one piece per turn — forward, sideways (Pikachu), or in any direction (Raichu).',
    pieces: [{ code: 'wp', size: 44 }, { code: 'wr', size: 52 }],
  },
  {
    n: 2,
    title: 'Capture by jumping',
    body: 'Jump over an enemy piece to capture it. The capture hierarchy determines who can take whom.',
    pieces: [{ code: 'wq', size: 52 }, { code: 'bp', size: 36 }],
  },
  {
    n: 3,
    title: 'Promote and win',
    body: "Reach the back rank to promote to Raichu. Capture every enemy piece to win. No draws — ever.",
    pieces: [{ code: 'wp', size: 36 }, { code: 'wq', size: 52 }],
  },
];

const RESOURCES = [
  {
    label: 'Reference',
    title: 'Full Rules',
    desc:  'Complete ruleset: board setup, all piece movements, captures, promotion, and win conditions.',
    href:  '/rules',
  },
  {
    label: 'Guide',
    title: 'Strategy',
    desc:  'Opening principles, board control, tactical patterns, and endgame technique.',
    href:  '/strategy',
  },
  {
    label: 'Compare',
    title: 'Raichu vs Chess',
    desc:  'Similarities, differences, and what transfers from chess intuition.',
    href:  '/raichu-vs-chess',
  },
  {
    label: 'Articles',
    title: 'Blog',
    desc:  'Guides on abstract strategy, chess-like games, and game design.',
    href:  '/blog',
  },
];
