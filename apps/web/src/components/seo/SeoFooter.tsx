import Link from 'next/link';
import type { CSSProperties } from 'react';

const linkStyle: CSSProperties = {
  color: 'var(--c-muted)',
  textDecoration: 'none',
  fontSize: '0.875rem',
  display: 'block',
};

export function SeoFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--c-border)', padding: '2rem 1.5rem', backgroundColor: 'var(--c-bg-1)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>Play</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Link href="/play"        style={linkStyle}>Play Now</Link>
              <Link href="/rules"       style={linkStyle}>Rules</Link>
              <Link href="/how-to-play" style={linkStyle}>How to Play</Link>
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>Learn</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Link href="/strategy" style={linkStyle}>Strategy Guide</Link>
              <Link href="/faq"      style={linkStyle}>FAQ</Link>
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>Explore</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Link href="/chess-like-games"        style={linkStyle}>Chess-Like Games</Link>
              <Link href="/abstract-strategy-games" style={linkStyle}>Abstract Strategy Games</Link>
              <Link href="/chess-variants"          style={linkStyle}>Chess Variants</Link>
              <Link href="/raichu-vs-chess"         style={linkStyle}>Raichu vs Chess</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: '1rem', fontSize: '0.8125rem', color: 'var(--c-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>© 2026 Sanket Muchhala</span>
          <a href="https://github.com/sanketmuchhala" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--c-muted)', textDecoration: 'none' }}>GitHub</a>
        </div>
      </div>
    </footer>
  );
}

/** Reusable nav bar for SEO content pages */
export function SeoNav() {
  return (
    <header style={{ backgroundColor: 'var(--c-bg-1)', borderBottom: '1px solid var(--c-border)', padding: '1rem 1.5rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <Link href="/" style={{ fontWeight: 700, color: 'var(--c-text)', textDecoration: 'none', fontSize: '1.125rem' }}>Raichu</Link>
        <nav style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          {([['Play', '/play'], ['Rules', '/rules'], ['How to Play', '/how-to-play'], ['Strategy', '/strategy'], ['FAQ', '/faq']] as [string, string][]).map(([label, href]) => (
            <Link key={href} href={href} style={{ color: 'var(--c-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>{label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
