/**
 * Next.js Instrumentation
 * Required for Sentry initialization on the server
 */

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

// Export request error handler for React Server Components
export const onRequestError = Sentry.captureRequestError;
