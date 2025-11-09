/**
 * Next.js Instrumentation
 * Required for Sentry initialization on the server
 */

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../instrumentation-server');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../instrumentation-edge');
  }
}

// Export request error handler for React Server Components
export const onRequestError = Sentry.captureRequestError;
