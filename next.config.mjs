import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Azure Container Apps deployment
  output: 'standalone',

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sqordia.blob.core.windows.net',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Legacy redirects from React Router
  async redirects() {
    return [
      // Business plan redirects
      {
        source: '/plans/:id',
        destination: '/business-plan/:id/preview',
        permanent: true,
      },
      {
        source: '/plans/:id/preview',
        destination: '/business-plan/:id/preview',
        permanent: true,
      },
      // Auth redirects
      {
        source: '/register',
        destination: '/signup',
        permanent: true,
      },
      // Questionnaire redirects
      {
        source: '/interview/:planId',
        destination: '/questionnaire/:planId',
        permanent: true,
      },
      // Admin redirects
      {
        source: '/admin/overview',
        destination: '/admin',
        permanent: true,
      },
      // French locale redirects
      {
        source: '/fr/plans/:id',
        destination: '/fr/business-plan/:id/preview',
        permanent: true,
      },
      {
        source: '/fr/register',
        destination: '/fr/signup',
        permanent: true,
      },
      {
        source: '/fr/interview/:planId',
        destination: '/fr/questionnaire/:planId',
        permanent: true,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
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
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        // Cache static assets
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache fonts
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Webpack config for compatibility
  webpack: (config) => {
    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // TypeScript strict mode - allow errors during migration
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withNextIntl(nextConfig);
