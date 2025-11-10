'use client';

/**
 * Global Error Handler
 * Catches React rendering errors and reports to Sentry
 */

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/design-system/components/atoms/button';
import styles from './global-error.module.css';

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
        <div className={styles.container}>
          <div className={styles.card}>
            <h1 className={styles.title}>
              ERROR
            </h1>
            <p className={styles.message}>
              Something went wrong. Our team has been notified.
            </p>
            <Button
              onClick={reset}
              variant="outline"
            >
              TRY AGAIN
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
