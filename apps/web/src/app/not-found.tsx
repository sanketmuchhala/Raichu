import Link from 'next/link';
import { Navbar } from '../components/nav/Navbar';

const SUGGESTIONS = [
  { href: '/play',        label: 'Play vs AI' },
  { href: '/lobby',       label: 'Play Online' },
  { href: '/rules',       label: 'Rules' },
  { href: '/how-to-play', label: 'How to Play' },
  { href: '/blog',        label: 'Blog' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

export default function NotFound() {
  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: '#f0ece8' }}>
      <Navbar />
      <main
        style={{
          maxWidth: 560,
          margin: '0 auto',
          padding: '5rem 1.5rem 4rem',
          textAlign: 'center',
        }}
      >
        {/* Mini board decoration */}
        <div
          style={{
            display: 'inline-grid',
            gridTemplateColumns: 'repeat(4, 28px)',
            gridTemplateRows: 'repeat(4, 28px)',
            gap: 0,
            marginBottom: '2.5rem',
            opacity: 0.25,
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 28, height: 28,
                backgroundColor: (Math.floor(i / 4) + (i % 4)) % 2 === 0 ? '#F0D9B5' : '#B58863',
              }}
            />
          ))}
        </div>

        <p style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1, marginBottom: '0.5rem', color: '#769656' }}>
          404
        </p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Page not found
        </h1>
        <p style={{ color: '#7a7a7a', fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          This square is empty. The page you are looking for does not exist or has moved.
        </p>

        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            backgroundColor: '#769656',
            color: '#fff',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: '0.9375rem',
            textDecoration: 'none',
            marginBottom: '3rem',
          }}
        >
          Back to Home
        </Link>

        <div style={{ borderTop: '1px solid #333', paddingTop: '2rem' }}>
          <p style={{ color: '#7a7a7a', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Or go to one of these pages:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {SUGGESTIONS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '0.375rem 0.875rem',
                  backgroundColor: '#242424',
                  border: '1px solid #333',
                  borderRadius: 6,
                  color: '#7a7a7a',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
