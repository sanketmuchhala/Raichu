import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/seo';

const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] }[] = [
  { path: '/',                          priority: 1.0,  changeFrequency: 'weekly'  },
  { path: '/play',                      priority: 0.9,  changeFrequency: 'monthly' },
  { path: '/rules',                     priority: 0.9,  changeFrequency: 'monthly' },
  { path: '/how-to-play',              priority: 0.8,  changeFrequency: 'monthly' },
  { path: '/strategy',                  priority: 0.8,  changeFrequency: 'monthly' },
  { path: '/faq',                       priority: 0.7,  changeFrequency: 'monthly' },
  { path: '/chess-like-games',         priority: 0.7,  changeFrequency: 'monthly' },
  { path: '/abstract-strategy-games',  priority: 0.7,  changeFrequency: 'monthly' },
  { path: '/chess-variants',            priority: 0.7,  changeFrequency: 'monthly' },
  { path: '/raichu-vs-chess',          priority: 0.7,  changeFrequency: 'monthly' },
  { path: '/leaderboard',              priority: 0.5,  changeFrequency: 'daily'   },
  { path: '/lobby',                     priority: 0.5,  changeFrequency: 'weekly'  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url:            `${SITE_URL}${path}`,
    lastModified:   new Date(),
    changeFrequency,
    priority,
  }));
}
