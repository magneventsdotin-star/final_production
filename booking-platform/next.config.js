const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  swcMinify: true,
  poweredByHeader: false,
  trailingSlash: false, // Enforce no trailing slashes for SEO consistency
  experimental: {
    externalDir: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    const path = require('path');
    config.resolve.alias['@database'] = path.resolve(__dirname, '../database');
    config.resolve.alias['@helpers'] = path.resolve(__dirname, '../helpers');
    config.resolve.alias['framer-motion'] = path.resolve(__dirname, 'lib/framer-motion-mock.js');
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ];
    return config;
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-1802bb19214743ffa99aa227f25e7ede.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    minimumCacheTTL: 60,
  },
  async headers() {
    const headers = [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];

    if (process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development') {
      headers.push({
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
        source: '/:path*',
      });
    }
    
    return headers;
  },
  async rewrites() {
    return [
      {
        source: '/sitemap_index.xml',
        destination: '/sitemap.xml',
      },
      {
        source: '/page-sitemap.xml',
        destination: '/sitemap.xml',
      },
    ];
  },
  async redirects() {
    const seoRedirects = [
      'live-singers-in-delhi',
      'live-singer-for-house-party',
      'book-singer-for-house-party',
      'singer-for-house-party',
      'guitarist-near-me',
      'book-live-singer',
      'sufi-singers-in-delhi',
      'guitarist-for-house-party',
      'live-bands-for-wedding-in-delhi',
      'singer-in-delhi',
      'guitarist-at-home',
      'live-singer-for-house-party-near-me',
      'live-singer-near-me',
      'live-bands-in-delhi',
      'singer-for-birthday-party',
      'live-singer',
      'guitarist-for-birthday-party-in-delhi',
      'live-music-at-home',
      'live-music-singers-near-me',
      'singer-for-home-party',
      'live-band-for-wedding',
      'singer-near-me',
      'singers-for-wedding',
      'singer-at-home',
      'singer-for-house-party-in-gurgaon',
      'local-singers-near-me',
      'how-to-book-a-singer-in-delhi-for-your-next-event'
    ].map(keyword => ({
      source: `/${keyword}`,
      destination: '/artists',
      permanent: true,
    }));

    return [
      ...seoRedirects,
      {
        source: '/about',
        destination: '/blog-post',
        permanent: true,
      },
      {
        source: '/artist-registration',
        destination: '/register/artist',
        permanent: true,
      },
      {
        source: '/null',
        destination: '/',
        permanent: true,
      },
      {
        source: '/book',
        destination: '/',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/',
        permanent: true,
      },
      {
        source: '/live-musicians-for-hire-near-me',
        destination: '/artists',
        permanent: true,
      },
      {
        source: '/singers-in-delhi',
        destination: '/artists',
        permanent: true,
      },
      {
        source: '/book-singer-for-house-party',
        destination: '/artists',
        permanent: true,
      },
      {
        source: '/book-top-singers',
        destination: '/artists',
        permanent: true,
      },
      {
        source: '/blog-post/booking-singer-for-house-party',
        destination: '/artists',
        permanent: true,
      },
      {
        source: '/search',
        destination: '/artists',
        permanent: true,
      },
      {
        source: '/how-to-book-a-singrs-in-delhi',
        destination: '/artists',
        permanent: true,
      },
      {
        source: '/how-to-book-a-singer-in-delhi',
        destination: '/artists',
        permanent: true,
      },
    ]
  }
}

module.exports = withPWA(nextConfig)
