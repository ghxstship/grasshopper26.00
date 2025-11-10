
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    domains: [
      'nhceygmzwmhuyqsjxquk.supabase.co',
      'zunesxhsexrqjrroeass.supabase.co',
      'images.unsplash.com',
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

// Sentry webpack plugin options
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: true,
  widenClientFileUpload: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
