import type { Metadata } from 'next';

// Must match the domain the site actually resolves at. The apex redirects to
// www, so using the apex here made every canonical, og:url and sitemap entry
// point at a redirect instead of the live URL.
export const SITE_URL  = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.raichu.live').replace(/\/$/, '');
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
