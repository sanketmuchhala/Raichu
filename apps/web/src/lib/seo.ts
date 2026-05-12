import type { Metadata } from 'next';

export const SITE_URL  = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raichugame.com').replace(/\/$/, '');
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
