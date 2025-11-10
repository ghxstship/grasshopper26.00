/**
 * GHXSTSHIP Geometric Loading Components
 * NO circular spinners - only geometric shapes
 */

import { cn } from '@/lib/utils';
import styles from './loading.module.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Geometric loading spinner using rotating squares (GHXSTSHIP compliant)
 */
export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: styles.spinnerSm,
    md: styles.spinnerMd,
    lg: styles.spinnerLg,
    xl: styles.spinnerXl,
  }[size];

  return (
    <div className={cn(styles.spinner, sizeClass, className)}>
      {/* Outer square */}
      <div className={styles.spinnerOuter} />
      {/* Inner square */}
      <div className={styles.spinnerInner} />
    </div>
  );
}

/**
 * Alternative geometric loader using triangles
 */
export function GeometricLoader({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: styles.spinnerSm,
    md: styles.spinnerMd,
    lg: styles.spinnerLg,
    xl: styles.spinnerXl,
  }[size];

  return (
    <div className={cn(styles.geometricLoader, sizeClass, className)}>
      <div className={styles.geometricPulse}>
        <svg viewBox="0 0 100 100" className={styles.geometricSvg}>
          <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({ message = 'Loading...', fullScreen = false }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        styles.overlay,
        fullScreen ? styles.overlayFullScreen : styles.overlayAbsolute
      )}
    >
      <LoadingSpinner size="lg" />
      {message && (
        <p className={styles.overlayMessage}>{message}</p>
      )}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'square' | 'rectangular';
}

/**
 * Geometric skeleton loader (GHXSTSHIP compliant - NO rounded corners)
 */
export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  return (
    <div
      className={cn(
        styles.skeleton,
        variant === 'text' && styles.skeletonText,
        className
      )}
    />
  );
}

/**
 * Geometric table skeleton (GHXSTSHIP compliant)
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className={styles.tableSkeleton}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.tableRow}>
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className={styles.tableCell} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Geometric card skeleton (GHXSTSHIP compliant - hard edges, thick borders)
 */
export function CardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <Skeleton className={styles.cardTitle} />
      <Skeleton className={styles.cardLine1} />
      <Skeleton className={styles.cardLine2} />
      <div className={styles.cardButtons}>
        <Skeleton className={styles.cardButton} />
        <Skeleton className={styles.cardButton} />
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className={styles.pageLoader}>
      <div className={styles.pageLoaderContent}>
        <LoadingSpinner size="xl" />
        <p className={styles.pageLoaderText}>Loading page...</p>
      </div>
    </div>
  );
}

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingButton({ loading, children, className }: LoadingButtonProps) {
  return (
    <button
      disabled={loading}
      className={cn(
        styles.loadingButton,
        loading && styles.loadingButtonDisabled,
        className
      )}
    >
      {loading && (
        <LoadingSpinner size="sm" className={styles.loadingButtonSpinner} />
      )}
      <span className={loading ? styles.loadingButtonText : ''}>{children}</span>
    </button>
  );
}
