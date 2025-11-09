'use client';

/**
 * Global Error Handler
 * Catches React rendering errors and reports to Sentry
 */

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/design-system/components/atoms/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full border-3 border-white p-8">
            <h1 className="font-anton text-hero uppercase mb-4">
              ERROR
            </h1>
            <p className="font-share text-body mb-6">
              Something went wrong. Our team has been notified.
            </p>
            <Button
              onClick={reset}
              variant="outline"
              className="w-full"
            >
              TRY AGAIN
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
