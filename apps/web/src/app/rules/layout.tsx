import type { Metadata } from 'next';
import { pageMetadata } from '../../lib/seo';
import { SchemaScript } from '../../components/seo/SchemaScript';

export const metadata: Metadata = pageMetadata({
  title:       'Raichu Game Rules | How to Play Raichu',
  description: 'Complete rules for Raichu: board setup, piece movement, capture hierarchy, promotion, and win conditions. Learn to play in minutes.',
  path:        '/rules',
});

export default function RulesLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type':    'Article',
    headline:   'Raichu Game Rules',
    description:'Complete rules for the Raichu abstract strategy board game.',
    author: { '@type': 'Organization', name: 'Raichu Game' },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://raichu.live' },
        { '@type': 'ListItem', position: 2, name: 'Rules', item: 'https://raichu.live/rules' },
      ],
    },
  };

  return (
    <>
      <SchemaScript schema={schema} />
      {children}
    </>
  );
}
