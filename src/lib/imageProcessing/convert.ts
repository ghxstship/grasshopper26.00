/**
 * Image B&W Conversion System
 * Converts images to monochrome for GHXSTSHIP design system
 */

/**
 * Conversion modes
 */
export type ConversionMode = 'pure-bw' | 'duotone-black-white' | 'duotone-black-grey' | 'high-contrast';

export interface ConversionOptions {
  mode: ConversionMode;
  threshold?: number; // 0-255, for pure B&W mode
  contrast?: number; // 0-2, for high-contrast mode
  brightness?: number; // -100 to 100
}

/**
 * Convert image to pure black and white (threshold-based)
 */
function convertToPureBW(
  imageData: ImageData,
  threshold: number = 128
): ImageData {
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Calculate grayscale value
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    
    // Apply threshold
    const value = avg > threshold ? 255 : 0;
    
    data[i] = value;     // R
    data[i + 1] = value; // G
    data[i + 2] = value; // B
    // Alpha channel (i + 3) remains unchanged
  }
  
  return imageData;
}

/**
 * Convert image to grayscale
 */
function convertToGrayscale(imageData: ImageData): ImageData {
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Use weighted average for better grayscale conversion
    const gray = Math.round(
      data[i] * 0.299 +       // R
      data[i + 1] * 0.587 +   // G
      data[i + 2] * 0.114     // B
    );
    
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  
  return imageData;
}

/**
 * Apply high contrast adjustment
 */
function applyHighContrast(
  imageData: ImageData,
  contrast: number = 1.5
): ImageData {
  const data = imageData.data;
  const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
  }
  
  return imageData;
}

/**
 * Apply brightness adjustment
 */
function applyBrightness(
  imageData: ImageData,
  brightness: number
): ImageData {
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] + brightness));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness));
  }
  
  return imageData;
}

/**
 * Convert image to monochrome based on options
 */
export async function convertToMonochrome(
  imageSource: string | HTMLImageElement | File,
  options: ConversionOptions = { mode: 'duotone-black-white' }
): Promise<string> {
  // Load image
  const img = await loadImage(imageSource);
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Draw image
  ctx.drawImage(img, 0, 0);
  
  // Get image data
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Apply brightness adjustment if specified
  if (options.brightness) {
    imageData = applyBrightness(imageData, options.brightness);
  }
  
  // Apply conversion based on mode
  switch (options.mode) {
    case 'pure-bw':
      imageData = convertToPureBW(imageData, options.threshold);
      break;
      
    case 'duotone-black-white':
    case 'duotone-black-grey':
      imageData = convertToGrayscale(imageData);
      break;
      
    case 'high-contrast':
      imageData = convertToGrayscale(imageData);
      imageData = applyHighContrast(imageData, options.contrast || 1.5);
      break;
  }
  
  // Put processed image data back
  ctx.putImageData(imageData, 0, 0);
  
  // Return as data URL
  return canvas.toDataURL('image/png');
}

/**
 * Load image from various sources
 */
async function loadImage(source: string | HTMLImageElement | File): Promise<HTMLImageElement> {
  if (source instanceof HTMLImageElement) {
    return source;
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    
    if (typeof source === 'string') {
      img.src = source;
    } else if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Batch convert multiple images
 */
export async function batchConvertImages(
  images: Array<string | File>,
  options: ConversionOptions = { mode: 'duotone-black-white' }
): Promise<string[]> {
  const conversions = images.map(img => convertToMonochrome(img, options));
  return Promise.all(conversions);
}

/**
 * Convert image and generate multiple sizes
 */
export async function convertAndResize(
  imageSource: string | File,
  sizes: number[] = [400, 800, 1200, 1600],
  options: ConversionOptions = { mode: 'duotone-black-white' }
): Promise<Record<number, string>> {
  const img = await loadImage(imageSource);
  const results: Record<number, string> = {};
  
  for (const size of sizes) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Calculate dimensions maintaining aspect ratio
    const aspectRatio = img.width / img.height;
    let width = size;
    let height = size / aspectRatio;
    
    if (height > size) {
      height = size;
      width = size * aspectRatio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw resized image
    ctx.drawImage(img, 0, 0, width, height);
    
    // Get and process image data
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    if (options.brightness) {
      imageData = applyBrightness(imageData, options.brightness);
    }
    
    switch (options.mode) {
      case 'pure-bw':
        imageData = convertToPureBW(imageData, options.threshold);
        break;
      case 'duotone-black-white':
      case 'duotone-black-grey':
        imageData = convertToGrayscale(imageData);
        break;
      case 'high-contrast':
        imageData = convertToGrayscale(imageData);
        imageData = applyHighContrast(imageData, options.contrast || 1.5);
        break;
    }
    
    ctx.putImageData(imageData, 0, 0);
    results[size] = canvas.toDataURL('image/png');
  }
  
  return results;
}

/**
 * Preset configurations for common use cases
 */
export const CONVERSION_PRESETS = {
  eventHero: {
    mode: 'high-contrast' as const,
    contrast: 1.8,
    brightness: 10,
  },
  artistPhoto: {
    mode: 'duotone-black-white' as const,
    contrast: 1.3,
    brightness: 0,
  },
  merchandise: {
    mode: 'pure-bw' as const,
    threshold: 140,
    brightness: 5,
  },
  userUpload: {
    mode: 'duotone-black-grey' as const,
    contrast: 1.2,
    brightness: 0,
  },
} as const;

/**
 * Quick conversion using preset
 */
export async function convertWithPreset(
  imageSource: string | File,
  preset: keyof typeof CONVERSION_PRESETS
): Promise<string> {
  return convertToMonochrome(imageSource, CONVERSION_PRESETS[preset]);
}
