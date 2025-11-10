/**
 * Image Processing Utilities
 * GHXSTSHIP Contemporary Minimal Pop Art Image Treatment
 * Convert all images to high-contrast B&W, duotone, or halftone
 */

export type ImageFilter = 
  | 'high-contrast-bw'
  | 'duotone-black-white'
  | 'duotone-black-grey'
  | 'halftone'
  | 'screen-print'
  | 'pure-bw';

export interface ImageProcessingOptions {
  filter: ImageFilter;
  contrast?: number;
  brightness?: number;
  halftoneSize?: number;
  quality?: number;
}

/**
 * Get CSS filter string for image treatment
 */
export function getImageFilter(filter: ImageFilter, options?: {
  contrast?: number;
  brightness?: number;
}): string {
  const { contrast = 1.5, brightness = 1 } = options || {};
  
  const filters: Record<ImageFilter, string> = {
    'high-contrast-bw': `grayscale(1) contrast(${contrast}) brightness(${brightness})`,
    'duotone-black-white': `grayscale(1) contrast(${contrast * 1.2}) brightness(${brightness})`,
    'duotone-black-grey': `grayscale(1) contrast(${contrast * 0.8}) brightness(${brightness * 1.1})`,
    'halftone': `grayscale(1) contrast(${contrast}) brightness(${brightness})`,
    'screen-print': `grayscale(1) contrast(${contrast * 1.5}) brightness(${brightness * 0.9})`,
    'pure-bw': `grayscale(1) contrast(2) brightness(${brightness})`,
  };
  
  return filters[filter];
}

/**
 * Apply halftone effect to canvas
 */
export function applyHalftoneEffect(
  canvas: HTMLCanvasElement,
  dotSize: number = 4,
  spacing: number = 8
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Create new canvas for halftone
  const halftoneCanvas = document.createElement('canvas');
  halftoneCanvas.width = canvas.width;
  halftoneCanvas.height = canvas.height;
  const halftoneCtx = halftoneCanvas.getContext('2d');
  if (!halftoneCtx) return;
  
  // Fill with white
  halftoneCtx.fillStyle = '#FFFFFF';
  halftoneCtx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw dots based on brightness
  for (let y = 0; y < canvas.height; y += spacing) {
    for (let x = 0; x < canvas.width; x += spacing) {
      const index = (y * canvas.width + x) * 4;
      const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
      const normalizedBrightness = brightness / 255;
      
      // Invert brightness for dot size (darker = larger dots)
      const dotRadius = ((1 - normalizedBrightness) * dotSize) / 2;
      
      if (dotRadius > 0) {
        halftoneCtx.fillStyle = '#000000';
        halftoneCtx.beginPath();
        halftoneCtx.arc(x + spacing / 2, y + spacing / 2, dotRadius, 0, Math.PI * 2);
        halftoneCtx.fill();
      }
    }
  }
  
  // Replace original canvas content
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(halftoneCanvas, 0, 0);
}

/**
 * Convert image to high-contrast black and white
 */
export function convertToHighContrastBW(
  canvas: HTMLCanvasElement,
  threshold: number = 128
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const bw = brightness > threshold ? 255 : 0;
    
    data[i] = bw;     // Red
    data[i + 1] = bw; // Green
    data[i + 2] = bw; // Blue
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply duotone effect
 */
export function applyDuotone(
  canvas: HTMLCanvasElement,
  darkColor: { r: number; g: number; b: number } = { r: 0, g: 0, b: 0 },
  lightColor: { r: number; g: number; b: number } = { r: 255, g: 255, b: 255 }
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const normalizedBrightness = brightness / 255;
    
    data[i] = darkColor.r + (lightColor.r - darkColor.r) * normalizedBrightness;
    data[i + 1] = darkColor.g + (lightColor.g - darkColor.g) * normalizedBrightness;
    data[i + 2] = darkColor.b + (lightColor.b - darkColor.b) * normalizedBrightness;
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply screen print effect
 */
export function applyScreenPrintEffect(
  canvas: HTMLCanvasElement,
  posterizeLevels: number = 4
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const step = 255 / (posterizeLevels - 1);
  
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const posterized = Math.round(brightness / step) * step;
    
    data[i] = posterized;
    data[i + 1] = posterized;
    data[i + 2] = posterized;
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Process image element with specified filter
 */
export async function processImage(
  imageElement: HTMLImageElement,
  options: ImageProcessingOptions
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Draw original image
  ctx.drawImage(imageElement, 0, 0);
  
  // Apply filter
  switch (options.filter) {
    case 'high-contrast-bw':
    case 'duotone-black-white':
    case 'duotone-black-grey':
      convertToHighContrastBW(canvas, 128);
      break;
    case 'halftone':
      applyHalftoneEffect(canvas, options.halftoneSize || 4, 8);
      break;
    case 'screen-print':
      applyScreenPrintEffect(canvas, 4);
      break;
    case 'pure-bw':
      convertToHighContrastBW(canvas, 128);
      break;
  }
  
  // Return as data URL
  return canvas.toDataURL('image/png', options.quality || 0.9);
}

/**
 * Load and process image from URL
 */
export async function loadAndProcessImage(
  url: string,
  options: ImageProcessingOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = async () => {
      try {
        const processed = await processImage(img, options);
        resolve(processed);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

/**
 * Get CSS filter for real-time image treatment
 */
export function getRealtimeImageFilter(filter: ImageFilter): string {
  return getImageFilter(filter);
}

/**
 * Create image overlay element with filter
 */
export function createImageOverlay(
  imageUrl: string,
  filter: ImageFilter,
  opacity: number = 1
): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: absolute;
    inset: 0;
    background-image: url(${imageUrl});
    background-size: cover;
    background-position: center;
    filter: ${getImageFilter(filter)};
    opacity: ${opacity};
    pointer-events: none;
  `;
  
  return overlay;
}

/**
 * Validate image is monochromatic
 */
export function isMonochromatic(canvas: HTMLCanvasElement, tolerance: number = 10): boolean {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Check if RGB values are within tolerance
    if (Math.abs(r - g) > tolerance || Math.abs(g - b) > tolerance || Math.abs(r - b) > tolerance) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get dominant color from image (should be black/white/grey for GHXSTSHIP)
 */
export function getDominantColor(canvas: HTMLCanvasElement): { r: number; g: number; b: number } {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { r: 0, g: 0, b: 0 };
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    totalR += data[i];
    totalG += data[i + 1];
    totalB += data[i + 2];
    count++;
  }
  
  return {
    r: Math.round(totalR / count),
    g: Math.round(totalG / count),
    b: Math.round(totalB / count),
  };
}

/**
 * Image processing presets for common use cases
 */
export const IMAGE_PRESETS = {
  eventHero: {
    filter: 'high-contrast-bw' as ImageFilter,
    contrast: 1.8,
    brightness: 1.1,
  },
  artistPhoto: {
    filter: 'halftone' as ImageFilter,
    halftoneSize: 4,
    contrast: 1.5,
  },
  backgroundTexture: {
    filter: 'screen-print' as ImageFilter,
    contrast: 1.3,
    brightness: 0.9,
  },
  thumbnail: {
    filter: 'duotone-black-white' as ImageFilter,
    contrast: 1.6,
    brightness: 1.0,
  },
  gallery: {
    filter: 'pure-bw' as ImageFilter,
    contrast: 2.0,
    brightness: 1.0,
  },
} as const;

/**
 * Batch process multiple images
 */
export async function batchProcessImages(
  imageUrls: string[],
  options: ImageProcessingOptions,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const results: string[] = [];
  
  for (let i = 0; i < imageUrls.length; i++) {
    const processed = await loadAndProcessImage(imageUrls[i], options);
    results.push(processed);
    
    if (onProgress) {
      onProgress(i + 1, imageUrls.length);
    }
  }
  
  return results;
}

/**
 * Create responsive image srcset with filters
 */
export interface ResponsiveImageOptions {
  sizes: number[];
  filter: ImageFilter;
  quality?: number;
}

export async function createResponsiveSrcSet(
  imageUrl: string,
  options: ResponsiveImageOptions
): Promise<string> {
  const { sizes, filter, quality = 0.9 } = options;
  
  const srcsetParts: string[] = [];
  
  for (const size of sizes) {
    // In production, this would generate different sized images
    // For now, we'll use the same processed image
    const processed = await loadAndProcessImage(imageUrl, { filter, quality });
    srcsetParts.push(`${processed} ${size}w`);
  }
  
  return srcsetParts.join(', ');
}

/**
 * Lazy load image with processing
 */
export class LazyImageProcessor {
  private observer: IntersectionObserver | null = null;
  private processedImages: Map<string, string> = new Map();

  constructor(
    private options: ImageProcessingOptions,
    observerOptions?: IntersectionObserverInit
  ) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        observerOptions || { rootMargin: '50px' }
      );
    }
  }

  private async handleIntersection(entries: IntersectionObserverEntry[]): Promise<void> {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src && !this.processedImages.has(src)) {
          try {
            const processed = await loadAndProcessImage(src, this.options);
            this.processedImages.set(src, processed);
            img.src = processed;
            img.removeAttribute('data-src');
          } catch (error) {
            console.error('Failed to process image:', error);
          }
        }
        
        this.observer?.unobserve(img);
      }
    }
  }

  observe(img: HTMLImageElement): void {
    if (!this.observer) return;
    this.observer.observe(img);
  }

  disconnect(): void {
    if (!this.observer) return;
    this.observer.disconnect();
    this.processedImages.clear();
  }
}
