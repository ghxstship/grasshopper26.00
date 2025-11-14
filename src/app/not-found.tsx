/**
 * 404 Not Found Page
 * GHXSTSHIP Atomic Design System
 */

import Link from 'next/link';
import { Button, PageTemplate } from '@/design-system';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <PageTemplate showHeader={false} showFooter={false}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.errorCode}>
            404
          </h1>
          
          <h2 className={styles.title}>
            PAGE NOT FOUND
          </h2>
          
          <p className={styles.description}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          
          <Link href="/" className={styles.link}>
            <Button variant="primary" size="lg">
              BACK TO HOME
            </Button>
          </Link>
        </div>
      </div>
    </PageTemplate>
  );
}
