import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Raichu — Strategy Board Game',
  description: 'Play Raichu, a checkers-variant strategy board game with Pichu, Pikachu, and Raichu pieces.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
