/**
 * GHXSTSHIP Geometric Loading Components
 * NO circular spinners - only geometric shapes
 */

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Geometric loading spinner using rotating squares (GHXSTSHIP compliant)
 */
export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Outer square */}
      <div className="absolute inset-0 border-3 border-black animate-spin" style={{ animationDuration: '1.5s' }} />
      {/* Inner square */}
      <div className="absolute inset-2 border-2 border-grey-600 animate-spin" style={{ animationDuration: '1s', animationDirection: 'reverse' }} />
    </div>
  );
}

/**
 * Alternative geometric loader using triangles
 */
export function GeometricLoader({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div className="absolute inset-0 animate-pulse">
        <svg viewBox="0 0 100 100" className="w-full h-full">
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
        'flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm',
        fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0'
      )}
    >
      <LoadingSpinner size="lg" />
      {message && (
        <p className="mt-4 text-sm font-medium text-gray-700">{message}</p>
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
  const variantClasses = {
    text: 'h-4 w-full',
    square: '', // No rounding - hard edges only
    rectangular: '', // No rounding - hard edges only
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-grey-200 border-2 border-grey-300',
        variantClasses[variant],
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
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-12 flex-1" />
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
    <div className="border-3 border-black p-6 space-y-4 shadow-geometric">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-lg font-medium text-gray-700">Loading page...</p>
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
        'relative inline-flex items-center justify-center',
        loading && 'opacity-70 cursor-not-allowed',
        className
      )}
    >
      {loading && (
        <LoadingSpinner size="sm" className="absolute left-4" />
      )}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
    </button>
  );
}
