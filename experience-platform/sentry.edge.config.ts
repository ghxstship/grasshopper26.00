import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Environment
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Edge runtime specific configuration
  integrations: [],
  
  // Breadcrumbs
  maxBreadcrumbs: 50,
  
  // Debug mode (only in development)
  debug: process.env.NODE_ENV === 'development',
});
