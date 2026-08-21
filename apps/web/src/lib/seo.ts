import type { Metadata } from 'next';

// The bare apex is the canonical domain. Search Console shows ~97% of all
// impressions (479 of 491) and every click landing on raichu.live URLs rather
// than www, so consolidating onto the apex keeps that accumulated history
// instead of asking Google to migrate it. www redirects here permanently.
export const SITE_URL  = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raichu.live').replace(/\/$/, '');
export const SITE_NAME = 'Raichu Game';

export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
}: {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
}): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title:       { absolute: title },
    description,
    alternates:  { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: 'en_US',
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
    },
  };
}
