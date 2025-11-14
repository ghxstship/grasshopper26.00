/**
 * Public Layout
 * Simple wrapper for public pages - PageTemplate handles header/footer
 */

import styles from './layout.module.css';

// Force dynamic rendering for all public pages to avoid window errors during SSR
export const dynamic = 'force-dynamic';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      {children}
    </div>
  );
}
