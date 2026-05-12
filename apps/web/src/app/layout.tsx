import type { Metadata, Viewport } from 'next';
import { Figtree } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { AuthProvider } from '../components/auth/AuthProvider';
import { SITE_URL, SITE_NAME } from '../lib/seo';

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default:  'Raichu Game | Chess-Inspired Strategy Board Game Online',
    template: '%s | Raichu Game',
  },
  description:
    'Play Raichu, a fast chess-inspired abstract strategy game playable free in your browser. Learn the rules, plan tactical moves, and challenge your mind.',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  openGraph: {
    siteName:  SITE_NAME,
    type:      'website',
    locale:    'en_US',
    url:       SITE_URL,
    title:     'Raichu Game | Chess-Inspired Strategy Board Game Online',
    description:
      'Play Raichu, a fast chess-inspired abstract strategy game, free in your browser.',
  },
  twitter: {
    card:  'summary_large_image',
    title: 'Raichu Game | Chess-Inspired Strategy Board Game Online',
    description:
      'Play Raichu, a fast chess-inspired abstract strategy game, free in your browser.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type':    'WebSite',
  name:       SITE_NAME,
  url:        SITE_URL,
  description:'A chess-inspired abstract strategy board game playable free in the browser.',
  potentialAction: {
    '@type':       'SearchAction',
    target:        `${SITE_URL}/faq`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={figtree.variable}>
      <body className="min-h-screen antialiased overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }}
        />
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
