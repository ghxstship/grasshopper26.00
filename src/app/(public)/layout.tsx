/**
 * Public Layout
 * Wraps all public-facing pages with header and footer
 */

import { SiteHeader } from '@/design-system/components/organisms/layout/site-header';
import { SiteFooter } from '@/design-system/components/organisms/layout/site-footer';
import styles from './layout.module.css';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <SiteHeader />
      <main className={styles.main}>{children}</main>
      <SiteFooter />
    </div>
  );
}
