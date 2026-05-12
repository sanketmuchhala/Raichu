import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt     = 'Raichu Game — Chess-Inspired Strategy';
export const size    = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          padding: '72px 80px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Chess board grid background */}
        <div
          style={{
            position: 'absolute',
            top: 0, right: 0,
            width: 480, height: 480,
            display: 'flex',
            flexWrap: 'wrap',
            opacity: 0.07,
          }}
        >
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 60, height: 60,
                backgroundColor: (Math.floor(i / 8) + (i % 8)) % 2 === 0 ? '#769656' : '#f0ece8',
              }}
            />
          ))}
        </div>

        {/* Green accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 0, top: 0,
            width: 6, height: '100%',
            backgroundColor: '#769656',
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 52, height: 52,
              borderRadius: 12,
              backgroundColor: '#769656',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            R
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#769656', letterSpacing: 2, textTransform: 'uppercase' }}>
            Raichu Game
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#f0ece8',
            lineHeight: 1.1,
            marginBottom: 24,
            maxWidth: 700,
          }}
        >
          Chess-Inspired Strategy. Zero Luck.
        </div>

        {/* Subheading */}
        <div
          style={{
            fontSize: 24,
            color: '#7a7a7a',
            lineHeight: 1.5,
            marginBottom: 48,
            maxWidth: 600,
          }}
        >
          Three piece types. Promotion tension. Games in 5–15 minutes. Free in your browser.
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 32 }}>
          {[
            { value: '5–15', label: 'min per game' },
            { value: '0',    label: 'luck involved' },
            { value: '3',    label: 'piece types' },
            { value: 'Free', label: 'no account needed' },
          ].map(({ value, label }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: '#769656' }}>{value}</span>
              <span style={{ fontSize: 14, color: '#7a7a7a', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 48, right: 80,
            fontSize: 16,
            color: '#333',
            fontFamily: 'monospace',
          }}
        >
          raichu.live
        </div>
      </div>
    ),
    { ...size }
  );
}
