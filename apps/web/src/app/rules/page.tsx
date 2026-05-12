'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { PieceChar } from '@raichu/shared-types';
import { useUIStore } from '../../store/ui-store';
import { THEMES, type Theme } from '../../lib/themes';
import { Navbar } from '../../components/nav/Navbar';
import { MiniBoard } from '../../components/rules/MiniBoard';
import { AnimatedMiniBoard } from '../../components/rules/AnimatedMiniBoard';
import { PieceSVG } from '../../components/pieces/PieceSVG';

export default function RulesPage() {
  const theme = useUIStore((s) => THEMES[s.theme]);

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen px-4 py-8 lg:py-12"
        style={{ backgroundColor: theme.bgPrimary }}
      >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1
            className="text-3xl lg:text-4xl font-bold"
            style={{ color: theme.textPrimary, fontFamily: 'var(--font-sans, system-ui)' }}
          >
            How to Play Raichu
          </h1>
          <p className="mt-2 text-base" style={{ color: theme.textSecondary }}>
            A complete guide to the rules and mechanics.
          </p>
        </div>

        {/* Overview */}
        <Section title="Overview" theme={theme}>
          <p>
            Raichu is a strategy board game played on an 8&times;8 checkered board. Two
            players &mdash; White and Black &mdash; each command an army of three piece types:{' '}
            <Strong theme={theme}>Pichu</Strong>, <Strong theme={theme}>Pikachu</Strong>,
            and <Strong theme={theme}>Raichu</Strong>.
          </p>
          <p className="mt-3">
            The goal is simple: <Strong theme={theme}>capture all of your opponent&apos;s
            pieces</Strong> to win. White always moves first. White pieces move{' '}
            <Strong theme={theme}>down</Strong> the board, while Black pieces
            move <Strong theme={theme}>up</Strong>.
          </p>
        </Section>

        {/* Starting Position */}
        <Section title="Starting Position" theme={theme}>
          <p className="mb-6">
            Each player starts with 4 Pikachus and 4 Pichus arranged on alternating squares
            of their first two rows. The four center rows start empty. No Raichus are on the
            board at the start &mdash; they must be earned through promotion.
          </p>
          <div className="flex justify-center">
            <MiniBoard
              gridSize={8}
              pieces={[
                { row: 1, col: 0, piece: 'W' as PieceChar },
                { row: 1, col: 2, piece: 'W' as PieceChar },
                { row: 1, col: 4, piece: 'W' as PieceChar },
                { row: 1, col: 6, piece: 'W' as PieceChar },
                { row: 2, col: 1, piece: 'w' as PieceChar },
                { row: 2, col: 3, piece: 'w' as PieceChar },
                { row: 2, col: 5, piece: 'w' as PieceChar },
                { row: 2, col: 7, piece: 'w' as PieceChar },
                { row: 5, col: 0, piece: 'b' as PieceChar },
                { row: 5, col: 2, piece: 'b' as PieceChar },
                { row: 5, col: 4, piece: 'b' as PieceChar },
                { row: 5, col: 6, piece: 'b' as PieceChar },
                { row: 6, col: 1, piece: 'B' as PieceChar },
                { row: 6, col: 3, piece: 'B' as PieceChar },
                { row: 6, col: 5, piece: 'B' as PieceChar },
                { row: 6, col: 7, piece: 'B' as PieceChar },
              ]}
              caption="Starting position. White top, Black bottom."
            />
          </div>
        </Section>

        {/* The Pieces */}
        <div className="mb-12">
          <h2
            className="text-2xl font-bold mb-8"
            style={{ color: theme.textPrimary, fontFamily: 'var(--font-sans, system-ui)' }}
          >
            The Pieces
          </h2>

          {/* Pichu */}
          <PieceSection name="Pichu" subtitle="The Pawn" piece={'w' as PieceChar} theme={theme}>
            <p>
              Pichu is the basic foot soldier. It moves{' '}
              <Strong theme={theme}>one square diagonally forward</Strong>.
              White Pichus move diagonally down-left or down-right; Black Pichus move
              diagonally up-left or up-right.
            </p>
            <p className="mt-3">
              To capture, a Pichu <Strong theme={theme}>jumps diagonally</Strong> over an
              adjacent enemy piece, landing on the empty square beyond it. Pichus can{' '}
              <Strong theme={theme}>only capture other Pichus</Strong>.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              <AnimatedMiniBoard
                gridSize={5}
                animPiece={{ piece: 'w' as PieceChar, fromRow: 2, fromCol: 2, toRow: 3, toCol: 3 }}
                caption="Movement: one square diagonally forward"
                phaseOffsetMs={0}
              />
              <AnimatedMiniBoard
                gridSize={5}
                staticPieces={[{ row: 2, col: 2, piece: 'b' as PieceChar }]}
                animPiece={{ piece: 'w' as PieceChar, fromRow: 1, fromCol: 1, toRow: 3, toCol: 3 }}
                capture={{ piece: 'b' as PieceChar, row: 2, col: 2 }}
                caption="Capture: jump over an enemy Pichu"
                phaseOffsetMs={400}
              />
            </div>
          </PieceSection>

          {/* Pikachu */}
          <PieceSection name="Pikachu" subtitle="The Rook" piece={'W' as PieceChar} theme={theme}>
            <p>
              Pikachu is a more powerful piece that moves{' '}
              <Strong theme={theme}>1 or 2 squares forward, left, or right</Strong>{' '}
              (orthogonally). It cannot move diagonally or backward.
            </p>
            <p className="mt-3">
              To capture, a Pikachu <Strong theme={theme}>jumps over</Strong> an enemy piece
              along the forward, left, or right direction. If the enemy is 1 square away,
              the Pikachu lands 2 squares from its start. If the enemy is 2 squares away,
              it lands 3 squares away. Pikachus can capture{' '}
              <Strong theme={theme}>Pichus and other Pikachus</Strong>, but not Raichus.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              <AnimatedMiniBoard
                gridSize={5}
                animPiece={{ piece: 'W' as PieceChar, fromRow: 2, fromCol: 2, toRow: 4, toCol: 2 }}
                caption="Movement: 1-2 squares forward"
                phaseOffsetMs={200}
              />
              <AnimatedMiniBoard
                gridSize={5}
                staticPieces={[{ row: 2, col: 2, piece: 'b' as PieceChar }]}
                animPiece={{ piece: 'W' as PieceChar, fromRow: 1, fromCol: 2, toRow: 3, toCol: 2 }}
                capture={{ piece: 'b' as PieceChar, row: 2, col: 2 }}
                caption="Capture: jump over an adjacent enemy"
                phaseOffsetMs={600}
              />
            </div>
          </PieceSection>

          {/* Raichu */}
          <PieceSection name="Raichu" subtitle="The Queen" piece={'@' as PieceChar} theme={theme}>
            <p>
              Raichu is the most powerful piece on the board. It moves{' '}
              <Strong theme={theme}>any number of squares in any of the 8 directions</Strong>{' '}
              &mdash; forward, backward, left, right, and all four diagonals &mdash; similar
              to a queen in chess.
            </p>
            <p className="mt-3">
              To capture, a Raichu <Strong theme={theme}>jumps over</Strong> an enemy piece
              along any direction and can land on{' '}
              <Strong theme={theme}>any empty square beyond</Strong> the captured piece.
              Raichus can capture <Strong theme={theme}>any piece type</Strong>.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              <AnimatedMiniBoard
                gridSize={5}
                animPiece={{ piece: '@' as PieceChar, fromRow: 2, fromCol: 2, toRow: 0, toCol: 4 }}
                caption="Movement: any direction, any distance"
                phaseOffsetMs={100}
              />
              <AnimatedMiniBoard
                gridSize={5}
                staticPieces={[{ row: 2, col: 2, piece: 'B' as PieceChar }]}
                animPiece={{ piece: '@' as PieceChar, fromRow: 0, fromCol: 0, toRow: 4, toCol: 4 }}
                capture={{ piece: 'B' as PieceChar, row: 2, col: 2 }}
                caption="Capture: jump over enemy, land anywhere beyond"
                phaseOffsetMs={500}
              />
            </div>
          </PieceSection>
        </div>

        {/* Capture Hierarchy */}
        <Section title="Capture Hierarchy" theme={theme}>
          <p className="mb-4">
            Not every piece can capture every other piece. The capture hierarchy determines
            which pieces are valid targets:
          </p>
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: `1px solid ${theme.border}` }}
          >
            {([
              { name: 'Pichu', piece: 'w' as PieceChar, targets: 'Pichu only' },
              { name: 'Pikachu', piece: 'W' as PieceChar, targets: 'Pichu + Pikachu' },
              { name: 'Raichu', piece: '@' as PieceChar, targets: 'Any piece' },
            ]).map((row, i) => (
              <div
                key={row.name}
                className="flex items-center gap-4 p-4"
                style={{
                  backgroundColor: i % 2 === 0 ? theme.bgPanel : theme.bgSecondary,
                  borderTop: i > 0 ? `1px solid ${theme.border}` : undefined,
                }}
              >
                <div className="flex-shrink-0">
                  <PieceSVG piece={row.piece} size={32} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
                    {row.name}
                  </div>
                  <div className="text-xs" style={{ color: theme.textSecondary }}>
                    Captures: <Strong theme={theme}>{row.targets}</Strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Promotion */}
        <Section title="Promotion" theme={theme}>
          <p>
            When a <Strong theme={theme}>Pichu or Pikachu</Strong> reaches the far edge of
            the board (the opponent&apos;s back row), it is immediately{' '}
            <Strong theme={theme}>promoted to a Raichu</Strong> &mdash; the most powerful
            piece on the board.
          </p>
          <p className="mt-3">
            For White, the promotion row is the bottom edge (row 8). For Black, it&apos;s
            the top edge (row 1). Promotion is automatic and happens at the end of the move.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            <MiniBoard
              gridSize={5}
              pieces={[{ row: 3, col: 2, piece: 'w' as PieceChar }]}
              highlights={[
                { row: 3, col: 2, type: 'selected' },
                { row: 4, col: 1, type: 'move' },
                { row: 4, col: 3, type: 'move' },
              ]}
              caption="Pichu about to reach the last row..."
            />
            <MiniBoard
              gridSize={5}
              pieces={[{ row: 4, col: 3, piece: '@' as PieceChar }]}
              highlights={[{ row: 4, col: 3, type: 'selected' }]}
              caption="...becomes a Raichu!"
            />
          </div>
        </Section>

        {/* How to Win */}
        <Section title="How to Win" theme={theme}>
          <p>
            The game ends when one player has{' '}
            <Strong theme={theme}>no pieces remaining</Strong>. The player who captures all
            of their opponent&apos;s pieces wins the game. There are no draws &mdash; every
            game ends with a winner.
          </p>
        </Section>

        {/* Key Rules */}
        <Section title="Key Rules" theme={theme}>
          <ul className="space-y-3">
            {[
              'Captures are not mandatory. You may choose any legal move on your turn.',
              'Only one capture per move. No multi-jump or chain capturing.',
              'Pieces cannot jump over or move through friendly pieces.',
              'The board does not wrap around. Pieces cannot move off one edge and appear on the other.',
              'White always moves first.',
            ].map((rule, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: theme.accent + '20', color: theme.accent }}
                >
                  {i + 1}
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* CTA */}
        <div className="text-center mt-16 mb-8">
          <p className="text-lg mb-6" style={{ color: theme.textSecondary }}>
            Ready to play?
          </p>
          <Link
            href="/play"
            className="inline-block px-8 py-3 rounded-lg font-bold text-base transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.accent, color: '#fff' }}
          >
            Play Now
          </Link>
        </div>
      </div>

      {/* SEO internal links */}
      <nav style={{ borderTop: `1px solid ${theme.border}`, padding: '1.5rem 2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        {[
          ['/how-to-play', 'How to Play'],
          ['/strategy', 'Strategy Guide'],
          ['/faq', 'FAQ'],
          ['/chess-like-games', 'Chess-Like Games'],
          ['/raichu-vs-chess', 'Raichu vs Chess'],
        ].map(([href, label]) => (
          <Link key={href} href={href} style={{ fontSize: '0.8125rem', color: theme.textSecondary, textDecoration: 'none' }}>{label}</Link>
        ))}
      </nav>

      <footer
        style={{
          borderTop: `1px solid ${theme.border}`,
          padding: '1.25rem 2rem',
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
        >
          GitHub
        </a>
      </footer>
    </main>
    </>
  );
}

function Strong({ theme, children }: { theme: Theme; children: ReactNode }) {
  return <strong style={{ color: theme.textPrimary }}>{children}</strong>;
}

function Section({
  title,
  theme,
  children,
}: {
  title: string;
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2
        className="text-xl lg:text-2xl font-bold mb-4 pb-2"
        style={{
          color: theme.textPrimary,
          fontFamily: 'var(--font-sans, system-ui)',
          borderBottom: `2px solid ${theme.border}`,
        }}
      >
        {title}
      </h2>
      <div className="leading-relaxed" style={{ color: theme.textSecondary }}>
        {children}
      </div>
    </section>
  );
}

function PieceSection({
  name,
  subtitle,
  piece,
  theme,
  children,
}: {
  name: string;
  subtitle: string;
  piece: PieceChar;
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <div
      className="mb-5 p-5 rounded-xl"
      style={{
        backgroundColor: theme.bgPanel,
        border: `1px solid ${theme.border}`,
        borderLeft: `3px solid ${theme.accent}`,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <PieceSVG piece={piece} size={40} />
        <div>
          <h3
            className="text-lg font-bold"
            style={{ color: theme.textPrimary, fontFamily: 'var(--font-sans, system-ui)' }}
          >
            {name}
          </h3>
          <span
            className="text-xs font-semibold tracking-wider uppercase"
            style={{ color: theme.accent }}
          >
            {subtitle}
          </span>
        </div>
      </div>
      <div className="leading-relaxed" style={{ color: theme.textSecondary }}>
        {children}
      </div>
    </div>
  );
}
