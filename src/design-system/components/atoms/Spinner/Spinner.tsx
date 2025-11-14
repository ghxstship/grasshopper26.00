/**
 * Spinner - Loading indicator atom
 * GHXSTSHIP Atomic Design System
 */

import styles from './Spinner.module.css';

export interface SpinnerProps {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional className */
  className?: string;
}

export function Spinner({
  size = 'md',
  className,
}: SpinnerProps) {
  const classNames = [
    styles.spinner,
    styles[`size-${size}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} role="status" aria-label="Loading">
      <div className={styles.inner} />
    </div>
  );
}
