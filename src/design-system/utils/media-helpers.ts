/**
 * Media Helper Utilities
 * GHXSTSHIP Entertainment Platform Media Management
 */

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  duration?: number;
  width?: number;
  height?: number;
}

/**
 * Get video embed URL
 */
export function getVideoEmbedUrl(url: string): string {
  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  
  // Vimeo
  if (url.includes('vimeo.com')) {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
  }
  
  return url;
}

/**
 * Get video thumbnail
 */
export function getVideoThumbnail(url: string): string {
  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  }
  
  return '';
}

/**
 * Format video duration
 */
export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Calculate media aspect ratio
 */
export function calculateMediaAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(baseUrl: string, widths: number[]): string {
  return widths.map(width => `${baseUrl}?w=${width} ${width}w`).join(', ');
}

/**
 * Generate responsive image sizes
 */
export function generateSizes(breakpoints: Array<{ breakpoint: string; size: string }>): string {
  return breakpoints
    .map(({ breakpoint, size }) => `(min-width: ${breakpoint}) ${size}`)
    .join(', ');
}

/**
 * Check if image is loaded
 */
export function isImageLoaded(img: HTMLImageElement): boolean {
  return img.complete && img.naturalHeight !== 0;
}

/**
 * Preload single image
 */
export function preloadSingleImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Lazy load image
 */
export function lazyLoadImage(img: HTMLImageElement, src: string): void {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    });
    
    observer.observe(img);
  } else {
    img.src = src;
  }
}

/**
 * Create placeholder image
 */
export function createPlaceholder(width: number, height: number, color: string = '#E5E5E5'): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Create blur placeholder (LQIP)
 */
export function createBlurPlaceholder(width: number = 40, height: number = 40): string {
  return createPlaceholder(width, height, '#D4D4D4');
}

/**
 * Get media type from URL
 */
export function getMediaType(url: string): 'image' | 'video' | 'audio' | 'unknown' {
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];
  
  const lowerUrl = url.toLowerCase();
  
  if (imageExts.some(ext => lowerUrl.endsWith(ext))) return 'image';
  if (videoExts.some(ext => lowerUrl.endsWith(ext))) return 'video';
  if (audioExts.some(ext => lowerUrl.endsWith(ext))) return 'audio';
  
  return 'unknown';
}

/**
 * Optimize image URL
 */
export function optimizeImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string {
  const params = new URLSearchParams();
  
  if (options.width) params.append('w', String(options.width));
  if (options.height) params.append('h', String(options.height));
  if (options.quality) params.append('q', String(options.quality));
  if (options.format) params.append('fm', options.format);
  
  const separator = url.includes('?') ? '&' : '?';
  return params.toString() ? `${url}${separator}${params.toString()}` : url;
}

/**
 * Create video poster
 */
export function createVideoPoster(videoUrl: string, time: number = 0): string {
  return `${videoUrl}#t=${time}`;
}

/**
 * Format audio duration
 */
export function formatAudioDuration(seconds: number): string {
  return formatVideoDuration(seconds);
}

/**
 * Get Spotify embed URL
 */
export function getSpotifyEmbedUrl(url: string): string {
  const match = url.match(/spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
  if (match) {
    const [, type, id] = match;
    return `https://open.spotify.com/embed/${type}/${id}`;
  }
  return url;
}

/**
 * Get SoundCloud embed URL
 */
export function getSoundCloudEmbedUrl(url: string): string {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`;
}

/**
 * Create gallery from media items
 */
export function createGallery(items: MediaItem[]): {
  images: MediaItem[];
  videos: MediaItem[];
  audio: MediaItem[];
} {
  return {
    images: items.filter(item => item.type === 'image'),
    videos: items.filter(item => item.type === 'video'),
    audio: items.filter(item => item.type === 'audio'),
  };
}

/**
 * Sort media by type
 */
export function sortMediaByType(items: MediaItem[]): MediaItem[] {
  const order = { image: 0, video: 1, audio: 2 };
  return [...items].sort((a, b) => order[a.type] - order[b.type]);
}

/**
 * Filter media by type
 */
export function filterMediaByType(items: MediaItem[], type: MediaItem['type']): MediaItem[] {
  return items.filter(item => item.type === type);
}

/**
 * Create media grid layout
 */
export function createMediaGrid(items: MediaItem[], columns: number = 3): MediaItem[][] {
  const grid: MediaItem[][] = [];
  
  for (let i = 0; i < items.length; i += columns) {
    grid.push(items.slice(i, i + columns));
  }
  
  return grid;
}

/**
 * Get image color palette (for monochromatic validation)
 */
export async function getImageColorPalette(imageUrl: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colors = new Set<string>();
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        colors.add(hex);
      }
      
      resolve(Array.from(colors));
    };
    
    img.onerror = reject;
    img.src = imageUrl;
  });
}

/**
 * Check if media is accessible
 */
export async function isMediaAccessible(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get media file size
 */
export async function getMediaFileSize(url: string): Promise<number> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const size = response.headers.get('content-length');
    return size ? parseInt(size, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Format media file size
 */
export function formatMediaFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
