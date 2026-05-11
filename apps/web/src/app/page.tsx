'use client';

import Link from 'next/link';
import type { PieceChar } from '@raichu/shared-types';
import { useUIStore } from '../store/ui-store';
import { THEMES } from '../lib/themes';
import { UserMenu } from '../components/auth/UserMenu';
import { PieceSVG } from '../components/pieces/PieceSVG';

export default function Home() {
  const theme = useUIStore((s) => THEMES[s.theme]);

  return (
    <div style={{ backgroundColor: theme.bgPrimary, minHeight: '100vh', color: theme.textPrimary }}>

      {/* ── Top nav ─────────────────────────────────────── */}
      <header
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          height: '56px',
          backgroundColor: theme.bgPrimary,
          borderBottom: `1px solid ${theme.border}`,
          zIndex: 50,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          fontWeight: 700,
          fontSize: '1.2rem',
          color: theme.textPrimary,
          letterSpacing: '0.02em',
        }}>
          Raichu
        </span>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/rules" style={{ fontSize: '0.875rem', color: theme.textSecondary, textDecoration: 'none' }}>
            Rules
          </Link>
          <Link href="/leaderboard" style={{ fontSize: '0.875rem', color: theme.textSecondary, textDecoration: 'none' }}>
            Leaderboard
          </Link>
          <Link href="/puzzles" style={{ fontSize: '0.875rem', color: theme.textSecondary, textDecoration: 'none' }}>
            Puzzles
          </Link>
          <UserMenu />
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '56px',
        textAlign: 'center',
        padding: '80px 2rem 3rem',
      }}>

        {/* Piece trio */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}>
          <div style={{ opacity: 0.75 }}>
            <PieceSVG piece={'b' as PieceChar} size={56} />
          </div>
          <div style={{ opacity: 0.75 }}>
            <PieceSVG piece={'B' as PieceChar} size={68} />
          </div>
          <PieceSVG piece={'$' as PieceChar} size={88} />
          <div style={{ opacity: 0.75 }}>
            <PieceSVG piece={'W' as PieceChar} size={68} />
          </div>
          <div style={{ opacity: 0.75 }}>
            <PieceSVG piece={'w' as PieceChar} size={56} />
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          fontSize: 'clamp(3rem, 10vw, 5.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.01em',
          lineHeight: 1,
          marginBottom: '1rem',
          color: theme.textPrimary,
        }}>
          Raichu
        </h1>

        <p style={{
          fontSize: '1.05rem',
          color: theme.textSecondary,
          marginBottom: '2.5rem',
          maxWidth: '38ch',
          lineHeight: 1.6,
        }}>
          A strategy board game with Pichu, Pikachu, and Raichu.
          Capture all your opponent&apos;s pieces to win.
        </p>

        {/* Primary CTAs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/play"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.75rem 1.875rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9375rem',
              backgroundColor: theme.accent,
              color: '#fff',
              textDecoration: 'none',
            }}
          >
            Play vs AI
          </Link>
          <Link
            href="/lobby"
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '0.75rem 1.875rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9375rem',
              backgroundColor: theme.bgPanel,
              color: theme.textPrimary,
              textDecoration: 'none',
              border: `1px solid ${theme.border}`,
            }}
          >
            Play Online
          </Link>
        </div>

        {/* Secondary links */}
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
          <Link href="/history"     style={{ fontSize: '0.875rem', color: theme.textSecondary, textDecoration: 'none' }}>Game History</Link>
          <Link href="/leaderboard" style={{ fontSize: '0.875rem', color: theme.textSecondary, textDecoration: 'none' }}>Leaderboard</Link>
        </div>
      </section>

      {/* ── Piece Guide ──────────────────────────────────── */}
      <section style={{ padding: '4rem 2rem 5rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair, Georgia, serif)',
          fontSize: '1.625rem',
          fontWeight: 700,
          color: theme.textPrimary,
          textAlign: 'center',
          marginBottom: '0.5rem',
        }}>
          The Pieces
        </h2>
        <p style={{ textAlign: 'center', color: theme.textSecondary, fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Three types, three different powers and capture rules.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}>
          {PIECES.map((p) => (
            <div
              key={p.name}
              style={{
                backgroundColor: theme.bgPanel,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '1.75rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.5rem',
              }}
            >
              {/* White + Black pair */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <PieceSVG piece={p.white as PieceChar} size={48} />
                <PieceSVG piece={p.black as PieceChar} size={48} />
              </div>

              <h3 style={{
                fontFamily: 'var(--font-playfair, Georgia, serif)',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: theme.textPrimary,
              }}>
                {p.name}
              </h3>
              <span style={{ fontSize: '0.7rem', color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                {p.role}
              </span>
              <p style={{ fontSize: '0.875rem', color: theme.textSecondary, lineHeight: 1.6 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How to Win ───────────────────────────────────── */}
      <section style={{ padding: '0 2rem 5rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            backgroundColor: theme.bgPanel,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '2.5rem 2rem',
          }}
        >
          <h2 style={{
            fontFamily: 'var(--font-playfair, Georgia, serif)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: theme.textPrimary,
            marginBottom: '0.875rem',
          }}>
            How to Win
          </h2>
          <p style={{ color: theme.textSecondary, lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.9375rem' }}>
            Capture every one of your opponent&apos;s pieces. Promote Pichus and
            Pikachus to Raichu by reaching the far edge. White moves first.
            No draws — every game has a winner.
          </p>
          <Link
            href="/rules"
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '0.7rem 1.75rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: theme.accent,
              textDecoration: 'none',
              border: `1.5px solid ${theme.accent}`,
            }}
          >
            Full Rules & Guide →
          </Link>
        </div>
      </section>

    </div>
  );
}

const PIECES = [
  {
    white: 'w', black: 'b',
    name: 'Pichu', role: 'Pawn',
    desc: 'Moves one square diagonally forward. Can only capture other Pichus by jumping over them.',
  },
  {
    white: 'W', black: 'B',
    name: 'Pikachu', role: 'Rook',
    desc: 'Moves 1–2 squares forward or sideways. Can capture Pichus and Pikachus, but not Raichu.',
  },
  {
    white: '@', black: '$',
    name: 'Raichu', role: 'Queen',
    desc: 'Moves any direction, any distance. Captures any piece. Earned by promoting a Pichu or Pikachu.',
  },
];
