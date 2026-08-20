import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/seo';

const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] }[] = [
  // Core
  { path: '/',                                                     priority: 1.0,  changeFrequency: 'weekly'  },
  { path: '/play',                                                 priority: 0.9,  changeFrequency: 'monthly' },
  { path: '/rules',                                                priority: 0.9,  changeFrequency: 'monthly' },
  { path: '/how-to-play',                                          priority: 0.8,  changeFrequency: 'monthly' },
  { path: '/strategy',                                             priority: 0.8,  changeFrequency: 'monthly' },
  { path: '/faq',                                                  priority: 0.7,  changeFrequency: 'monthly' },
  // Comparison / info pages
  { path: '/abstract-strategy-games',                              priority: 0.7,  changeFrequency: 'monthly' },
  { path: '/chess-variants',                                       priority: 0.7,  changeFrequency: 'monthly' },
  { path: '/raichu-vs-chess',                                      priority: 0.7,  changeFrequency: 'monthly' },
  // Blog hub
  { path: '/blog',                                                 priority: 0.7,  changeFrequency: 'weekly'  },
  // Blog — Raichu guides
  { path: '/blog/raichu-piece-guide',                              priority: 0.65, changeFrequency: 'monthly' },
  { path: '/blog/raichu-opening-strategy',                         priority: 0.65, changeFrequency: 'monthly' },
  { path: '/blog/raichu-endgame-strategy',                         priority: 0.65, changeFrequency: 'monthly' },
  // Blog — Chess comparisons
  { path: '/blog/what-makes-a-game-chess-like',                    priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/blog/games-like-chess',                                priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/blog/raichu-for-chess-players',                        priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/blog/raichu-vs-checkers',                              priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/blog/chess-without-memorization',                      priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/blog/chess-for-competitive-players',                   priority: 0.6,  changeFrequency: 'monthly' },
  // Blog — Abstract strategy
  { path: '/blog/piece-hierarchy-in-board-games',                  priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/blog/abstract-strategy-games-for-beginners',           priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/blog/strategy-games-for-beginners',                    priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/blog/why-play-strategy-games',                         priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/blog/board-games-no-luck',                             priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/blog/role-of-luck-in-board-games',                     priority: 0.6,  changeFrequency: 'monthly' },
  // Blog — Online / multiplayer
  { path: '/blog/two-player-board-games',                          priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/blog/free-two-player-games-online',                    priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/blog/two-player-games-no-account',                     priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/blog/online-board-games-no-download',                  priority: 0.6,  changeFrequency: 'monthly' },
  // Blog — Speed / format
  { path: '/blog/fast-strategy-games',                             priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/blog/best-free-browser-strategy-games',                priority: 0.6,  changeFrequency: 'monthly' },
  { path: '/blog/best-strategy-games-2025',                        priority: 0.6,  changeFrequency: 'yearly'  },
  { path: '/blog/how-to-improve-at-board-games',                   priority: 0.6,  changeFrequency: 'monthly' },
  // App pages are deliberately absent.
  //   /lobby       is Disallow-ed in robots.ts, so listing it here contradicted that.
  //   /leaderboard renders empty to crawlers: the profiles RLS policy is
  //                TO authenticated, so a signed-out visitor (and Googlebot)
  //                sees "No players yet". Indexing an empty page is worse than
  //                not indexing it. Revisit if profiles ever become public.
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url:            `${SITE_URL}${path}`,
    lastModified:   new Date(),
    changeFrequency,
    priority,
  }));
}
