/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@raichu/shared-types', '@raichu/game-engine', '@raichu/ai-engine'],

  async redirects() {
    return [
      // Common URL typos / plurals
      { source: '/blogs',        destination: '/blog',   permanent: true },
      { source: '/blogs/:path*', destination: '/blog/:path*', permanent: true },
      { source: '/games',        destination: '/lobby',  permanent: false },
      // Parent paths that have no page of their own
      { source: '/game',         destination: '/lobby',  permanent: false },
      { source: '/join',         destination: '/lobby',  permanent: false },
      // Other common misses
      { source: '/register',     destination: '/auth',   permanent: true },
      { source: '/login',        destination: '/auth',   permanent: true },
      { source: '/signup',       destination: '/auth',   permanent: true },
      { source: '/sign-in',      destination: '/auth',   permanent: true },
      { source: '/sign-up',      destination: '/auth',   permanent: true },
      { source: '/leaderboards', destination: '/leaderboard', permanent: true },
      { source: '/rule',         destination: '/rules',  permanent: true },
      { source: '/faqs',         destination: '/faq',    permanent: true },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
