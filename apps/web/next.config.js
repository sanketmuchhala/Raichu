/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@raichu/shared-types', '@raichu/game-engine'],
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
