/**
 * Error Page
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button, PageTemplate } from '@/design-system';
import styles from './error.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageTemplate showHeader={false} showFooter={false}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.errorTitle}>
            ERROR
          </h1>
          
          <h2 className={styles.title}>
            SOMETHING WENT WRONG
          </h2>
          
          <p className={styles.description}>
            An unexpected error occurred. Please try again.
          </p>
          
          <div className={styles.actions}>
            <Button variant="secondary" size="lg" onClick={reset}>
              TRY AGAIN
            </Button>
            <Link href="/" className={styles.link}>
              <Button variant="primary" size="lg">
                BACK TO HOME
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
