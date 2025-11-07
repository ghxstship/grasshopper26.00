import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  integrations: [
    Sentry.httpIntegration(),
    Sentry.prismaIntegration(),
  ],
  
  // Environment
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Error filtering
  beforeSend(event, hint) {
    // Add server context
    if (event.request) {
      event.request.headers = {
        ...event.request.headers,
        'x-forwarded-for': event.request.headers?.['x-forwarded-for'] || 'unknown',
      };
    }
    
    return event;
  },
  
  // Ignore certain errors
  ignoreErrors: [
    // Database connection errors (handled separately)
    'ECONNREFUSED',
    'ETIMEDOUT',
    // Expected API errors
    'Unauthorized',
    'Forbidden',
    'Not Found',
  ],
  
  // Breadcrumbs
  maxBreadcrumbs: 100,
  
  // Debug mode (only in development)
  debug: process.env.NODE_ENV === 'development',
  
  // Enable profiling
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});
