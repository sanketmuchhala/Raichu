'use client';

import Link from 'next/link';
import { useUIStore } from '../store/ui-store';
import { THEMES } from '../lib/themes';
import { UserMenu } from '../components/auth/UserMenu';

const CDN = 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150';
const P   = (code: string) => `${CDN}/${code}.png`;

export default function Home() {
  const theme  = useUIStore((s) => THEMES[s.theme]);
  const accent = theme.accent;

  // Derived: a dimmed version of the accent for subtle borders (hex + alpha)
  const accentDim = accent + '3A';

  const cssVars = {
    '--lp3-accent':     accent,
    '--lp3-accent-dim': accentDim,
  } as React.CSSProperties;

  return (
    <div className="lp3" style={cssVars}>

      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="lp3-nav">
        <span className="lp3-nav-logo">Raichu</span>
        <nav className="lp3-nav-links">
          <Link href="/rules"       className="lp3-nav-link">Rules</Link>
          <Link href="/leaderboard" className="lp3-nav-link">Leaderboard</Link>
          <Link href="/puzzles"     className="lp3-nav-link">Puzzles</Link>
          <UserMenu />
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="lp3-hero">
        <div className="lp3-board-bg"     aria-hidden="true" />
        <div className="lp3-hero-vignette" aria-hidden="true" />

        {/* Floating piece showcase */}
        <div className="lp3-pieces lp3-r1">
          <div className="lp3-piece lp3-p1"><img src={P('bp')} width={58}  height={58}  alt="" draggable={false} /></div>
          <div className="lp3-piece lp3-p2"><img src={P('br')} width={72}  height={72}  alt="" draggable={false} /></div>
          <div className="lp3-piece lp3-p3"><img src={P('bq')} width={100} height={100} alt="" draggable={false} /></div>
          <div className="lp3-piece lp3-p4"><img src={P('wr')} width={72}  height={72}  alt="" draggable={false} /></div>
          <div className="lp3-piece lp3-p5"><img src={P('wp')} width={58}  height={58}  alt="" draggable={false} /></div>
        </div>

        <h1 className="lp3-title lp3-r2">Raichu</h1>
        <div className="lp3-rule lp3-r3" />

        <p className="lp3-subtitle lp3-r3">
          A strategy board game with three piece types.<br />
          Capture every enemy piece to win.
        </p>

        <div className="lp3-ctas lp3-r4">
          <Link href="/play"  className="lp3-btn-primary">▶ Play vs AI</Link>
          <Link href="/lobby" className="lp3-btn-ghost">Play Online</Link>
        </div>

        <nav className="lp3-aux lp3-r5">
          <Link href="/rules"       className="lp3-aux-link">How to Play</Link>
          <Link href="/puzzles"     className="lp3-aux-link">Puzzles</Link>
          <Link href="/leaderboard" className="lp3-aux-link">Leaderboard</Link>
          <Link href="/history"     className="lp3-aux-link">History</Link>
        </nav>
      </section>

      {/* ── Piece Cards ─────────────────────────────────── */}
      <section className="lp3-section">
        <p className="lp3-section-eyebrow">The Pieces</p>
        <h2 className="lp3-section-heading">Three types. Three powers.</h2>

        <div className="lp3-cards">
          {PIECES.map((p) => (
            <div key={p.name} className="lp3-card">
              <div className="lp3-card-imgs">
                <img src={P(p.wCode)} width={54} height={54} alt={`White ${p.name}`} draggable={false} />
                <img src={P(p.bCode)} width={54} height={54} alt={`Black ${p.name}`} draggable={false} />
              </div>
              <div className="lp3-card-name">{p.name}</div>
              <div className="lp3-card-role">{p.role}</div>
              <p className="lp3-card-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Finale ──────────────────────────────────────── */}
      <section className="lp3-finale">
        <div className="lp3-finale-card">
          <h2 className="lp3-finale-heading">How to Win</h2>
          <p className="lp3-finale-body">
            Capture every one of your opponent&apos;s pieces.
            Promote Pichus and Pikachus to Raichu by reaching the far edge.
            White moves first. No draws — every game has a winner.
          </p>
          <div className="lp3-finale-btns">
            <Link href="/play"  className="lp3-btn-primary">Start Playing</Link>
            <Link href="/lobby" className="lp3-btn-ghost">Play Online</Link>
          </div>
        </div>
      </section>

    </div>
  );
}

const PIECES = [
  { wCode:'wp', bCode:'bp', name:'Pichu',   role:'The Pawn',
    desc:'Moves one square diagonally forward. Can only capture other Pichus by jumping.' },
  { wCode:'wr', bCode:'br', name:'Pikachu', role:'The Rook',
    desc:'Moves 1–2 squares forward or sideways. Captures Pichus and Pikachus, not Raichu.' },
  { wCode:'wq', bCode:'bq', name:'Raichu',  role:'The Queen',
    desc:'Moves any direction, any distance. Captures anything. Earned through promotion.' },
];
