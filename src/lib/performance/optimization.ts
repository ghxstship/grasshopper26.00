/**
 * Performance optimization utilities
 * Implements best practices for Next.js applications
 */

import { cache as reactCache } from 'react';

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();

  return function memoized(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);

    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    return result;
  };
}

/**
 * React cache wrapper for server components
 */
export const serverCache = reactCache;

/**
 * Lazy load images with intersection observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = img.dataset.src;
              
              if (src) {
                img.src = src;
                img.removeAttribute('data-src');
                this.observer?.unobserve(img);
              }
            }
          });
        },
        {
          rootMargin: '50px', // eslint-disable-line no-restricted-syntax -- IntersectionObserver API requires pixel values
        }
      );
    }
  }

  observe(element: HTMLImageElement) {
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

/**
 * Prefetch data for faster navigation
 */
export function prefetchData(url: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    if (document.head) {
      document.head.appendChild(link);
    }
  }
}

/**
 * Preload critical resources
 */
export function preloadResource(url: string, as: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    document.head.appendChild(link);
  }
}

/**
 * Measure performance metrics
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  mark(name: string) {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      console.warn(`Start mark "${startMark}" not found`);
      return 0;
    }

    const duration = performance.now() - start;
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  clear() {
    this.marks.clear();
  }
}

/**
 * Batch multiple requests
 */
export class RequestBatcher<T, R> {
  private queue: Array<{
    item: T;
    resolve: (value: R) => void;
    reject: (error: any) => void;
  }> = [];
  private timeout: NodeJS.Timeout | null = null;
  private batchFn: (items: T[]) => Promise<R[]>;
  private wait: number;

  constructor(batchFn: (items: T[]) => Promise<R[]>, wait: number = 50) {
    this.batchFn = batchFn;
    this.wait = wait;
  }

  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject });

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => this.flush(), this.wait);
    });
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    try {
      const items = batch.map((b) => b.item);
      const results = await this.batchFn(items);

      batch.forEach((b, index) => {
        b.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach((b) => {
        b.reject(error);
      });
    }
  }
}

/**
 * Virtual scrolling helper
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = Math.min(totalItems, start + visibleCount + overscan * 2);

  return { start, end };
}

/**
 * Image optimization helper
 */
export function getOptimizedImageUrl(
  url: string,
  width: number,
  quality: number = 75
): string {
  // For Next.js Image Optimization API
  const params = new URLSearchParams({
    url,
    w: width.toString(),
    q: quality.toString(),
  });

  return `/_next/image?${params.toString()}`;
}

/**
 * Web Vitals tracking
 */
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      console.log('CLS:', clsScore);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
}

// Export singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const lazyImageLoader = new LazyImageLoader();
