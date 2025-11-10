/**
 * Performance Utilities
 * Optimization helpers for GHXSTSHIP platform
 */

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Request idle callback wrapper
 */
export function requestIdleTask(
  callback: () => void,
  options?: IdleRequestOptions
): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback to setTimeout
  const timeoutId: ReturnType<typeof setTimeout> | number = typeof window !== 'undefined' ? window.setTimeout(callback, 1) : 0;
  return timeoutId as number;
}

/**
 * Cancel idle callback
 */
export function cancelIdleTask(id: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else if (typeof window !== 'undefined') {
    window.clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
  }
}

/**
 * Lazy load component
 */
export function lazyLoad<T>(
  importFn: () => Promise<{ default: T }>
): () => Promise<{ default: T }> {
  let cached: { default: T } | null = null;
  
  return async () => {
    if (cached) return cached;
    cached = await importFn();
    return cached;
  };
}

/**
 * Memoize function
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator 
      ? keyGenerator(...args)
      : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Batch DOM reads
 */
export class DOMBatcher {
  private readQueue: Array<() => void> = [];
  private writeQueue: Array<() => void> = [];
  private scheduled = false;

  read(fn: () => void): void {
    this.readQueue.push(fn);
    this.schedule();
  }

  write(fn: () => void): void {
    this.writeQueue.push(fn);
    this.schedule();
  }

  private schedule(): void {
    if (this.scheduled) return;
    
    this.scheduled = true;
    requestAnimationFrame(() => {
      this.flush();
    });
  }

  private flush(): void {
    // Execute all reads first
    while (this.readQueue.length > 0) {
      const read = this.readQueue.shift();
      read?.();
    }
    
    // Then execute all writes
    while (this.writeQueue.length > 0) {
      const write = this.writeQueue.shift();
      write?.();
    }
    
    this.scheduled = false;
  }
}

/**
 * Intersection observer wrapper
 */
export function observeIntersection(
  element: Element,
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return () => {};
  }
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(callback);
    },
    options
  );
  
  observer.observe(element);
  
  return () => {
    observer.unobserve(element);
    observer.disconnect();
  };
}

/**
 * Resize observer wrapper
 */
export function observeResize(
  element: Element,
  callback: (entry: ResizeObserverEntry) => void
): () => void {
  if (typeof window === 'undefined' || !('ResizeObserver' in window)) {
    return () => {};
  }
  
  const observer = new ResizeObserver((entries) => {
    entries.forEach(callback);
  });
  
  observer.observe(element);
  
  return () => {
    observer.unobserve(element);
    observer.disconnect();
  };
}

/**
 * Mutation observer wrapper
 */
export function observeMutation(
  element: Element,
  callback: (mutations: MutationRecord[]) => void,
  options?: MutationObserverInit
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const observer = new MutationObserver(callback);
  observer.observe(element, options);
  
  return () => {
    observer.disconnect();
  };
}

/**
 * Preload image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload images batch
 */
export async function preloadImages(
  srcs: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  let loaded = 0;
  
  await Promise.all(
    srcs.map(async (src) => {
      await preloadImage(src);
      loaded++;
      onProgress?.(loaded, srcs.length);
    })
  );
}

/**
 * Prefetch resource
 */
export function prefetchResource(
  url: string,
  type: 'script' | 'style' | 'image' | 'font' = 'script'
): void {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = type;
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Preconnect to origin
 */
export function preconnect(url: string): void {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Measure performance
 */
export function measurePerformance(
  name: string,
  fn: () => void | Promise<void>
): void | Promise<void> {
  if (typeof performance === 'undefined') {
    return fn();
  }
  
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  
  performance.mark(startMark);
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      performance.mark(endMark);
      performance.measure(name, startMark, endMark);
    });
  }
  
  performance.mark(endMark);
  performance.measure(name, startMark, endMark);
  return result;
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics(): {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
} {
  if (typeof performance === 'undefined') return {};
  
  const metrics: ReturnType<typeof getPerformanceMetrics> = {};
  
  // First Contentful Paint
  const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
  if (fcpEntry) {
    metrics.fcp = fcpEntry.startTime;
  }
  
  // Time to First Byte
  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigationEntry) {
    metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
  }
  
  return metrics;
}

/**
 * Virtual scroll helper
 */
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  itemCount: number;
  overscan?: number;
}

export function calculateVirtualScroll(
  scrollTop: number,
  config: VirtualScrollConfig
): {
  startIndex: number;
  endIndex: number;
  offsetY: number;
} {
  const { itemHeight, containerHeight, itemCount, overscan = 3 } = config;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + overscan * 2);
  const offsetY = startIndex * itemHeight;
  
  return { startIndex, endIndex, offsetY };
}

/**
 * Web Worker wrapper
 */
export function createWorker<T = unknown, R = unknown>(
  workerFn: (data: T) => R
): {
  execute: (data: T) => Promise<R>;
  terminate: () => void;
} {
  const blob = new Blob(
    [`self.onmessage = ${workerFn.toString()}`],
    { type: 'application/javascript' }
  );
  
  const blobUrl = URL.createObjectURL(blob);
  const worker = new Worker(blobUrl);
  
  return {
    execute: (data: T) => {
      return new Promise<R>((resolve, reject) => {
        worker.onmessage = (e) => resolve(e.data);
        worker.onerror = reject;
        worker.postMessage(data);
      });
    },
    terminate: () => {
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
    },
  };
}

/**
 * Cache manager
 */
export class CacheManager<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private maxAge: number;
  private maxSize: number;

  constructor(maxAge: number = 5 * 60 * 1000, maxSize: number = 100) {
    this.maxAge = maxAge;
    this.maxSize = maxSize;
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value as string | undefined;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

/**
 * Request animation frame loop
 */
export function createAnimationLoop(
  callback: (deltaTime: number) => void
): {
  start: () => void;
  stop: () => void;
} {
  let rafId: number;
  let lastTime = 0;
  let isRunning = false;
  
  const loop = (currentTime: number) => {
    if (!isRunning) return;
    
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    callback(deltaTime);
    rafId = requestAnimationFrame(loop);
  };
  
  return {
    start: () => {
      if (isRunning) return;
      isRunning = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    },
    stop: () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
    },
  };
}

/**
 * Batch updates
 */
export function batchUpdates<T>(
  updates: Array<() => T>,
  batchSize: number = 10
): Promise<T[]> {
  return new Promise((resolve) => {
    const results: T[] = [];
    let currentIndex = 0;
    
    const processBatch = () => {
      const endIndex = Math.min(currentIndex + batchSize, updates.length);
      
      for (let i = currentIndex; i < endIndex; i++) {
        results.push(updates[i]());
      }
      
      currentIndex = endIndex;
      
      if (currentIndex < updates.length) {
        requestIdleTask(processBatch);
      } else {
        resolve(results);
      }
    };
    
    processBatch();
  });
}
