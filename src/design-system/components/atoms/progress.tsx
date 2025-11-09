/**
 * GHXSTSHIP Geometric Progress Bar
 * Thick, geometric, hard edges - NO soft gradients
 */

import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  variant?: 'default' | 'inverted';
}

export function Progress({
  value,
  size = 'md',
  showLabel = false,
  className,
  variant = 'default',
}: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  const variantClasses = {
    default: {
      container: 'bg-white border-3 border-black',
      bar: 'bg-black',
    },
    inverted: {
      container: 'bg-black border-3 border-white',
      bar: 'bg-white',
    },
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative overflow-hidden',
          sizeClasses[size],
          variantClasses[variant].container
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            variantClasses[variant].bar
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-2 flex justify-between font-share-mono text-meta">
          <span>{clampedValue}%</span>
          <span>COMPLETE</span>
        </div>
      )}
    </div>
  );
}

/**
 * Stepped progress bar with geometric segments
 */
interface SteppedProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function SteppedProgress({
  currentStep,
  totalSteps,
  className,
}: SteppedProgressProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'flex-1 h-4 border-3 transition-colors duration-300',
            index < currentStep
              ? 'bg-black border-black'
              : 'bg-white border-black'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Circular progress (using geometric square rotation)
 */
interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  className,
}: CircularProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const rotation = (clampedValue / 100) * 360;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      {/* Background square */}
      <div
        className="absolute inset-0 border-3 border-grey-300"
        style={{ borderWidth: strokeWidth }}
      />
      
      {/* Progress square (rotated) */}
      <div
        className="absolute inset-0 border-3 border-black transition-transform duration-500"
        style={{
          borderWidth: strokeWidth,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center',
        }}
      />

      {/* Label */}
      {showLabel && (
        <div className="relative z-10 text-center">
          <div className="font-anton text-h3 uppercase">{Math.round(clampedValue)}%</div>
        </div>
      )}
    </div>
  );
}

/**
 * Loading bar (indeterminate progress)
 */
export function LoadingBar({ className }: { className?: string }) {
  return (
    <div className={cn('w-full h-4 bg-white border-3 border-black overflow-hidden', className)}>
      <div
        className="h-full w-1/3 bg-black animate-[slide_1.5s_ease-in-out_infinite]"
        style={{
          animation: 'slide 1.5s ease-in-out infinite',
        }}
      />
      <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  );
}
