'use client';

/**
 * Global Error Handler
 * Catches React rendering errors and reports to Sentry
 */

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/design-system';
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
            <div className={styles.actions}>
              <Button
                onClick={reset}
                variant="secondary"
                size="lg"
                fullWidth
              >
                TRY AGAIN
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="secondary"
                size="lg"
                fullWidth
              >
                GO BACK
              </Button>
              <Button
                onClick={() => { window.location.href = '/'; }}
                variant="primary"
                size="lg"
                fullWidth
              >
                GO HOME
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
