/**
 * Supabase Storage Integration with B&W Image Processing
 * Automatically converts uploaded images to monochrome
 */

import { createClient } from './server';
import { convertToMonochrome, convertAndResize, ConversionOptions, CONVERSION_PRESETS } from '../imageProcessing/convert';

export type ImageCategory = 'event-hero' | 'artist-photo' | 'merchandise' | 'user-upload' | 'content';

export interface UploadOptions {
  category: ImageCategory;
  generateSizes?: boolean;
  sizes?: number[];
  convertToBW?: boolean;
  conversionOptions?: ConversionOptions;
}

export interface UploadResult {
  url: string;
  path: string;
  sizes?: Record<number, string>;
}

/**
 * Get bucket name for image category
 */
function getBucketForCategory(category: ImageCategory): string {
  const buckets: Record<ImageCategory, string> = {
    'event-hero': 'events',
    'artist-photo': 'artists',
    'merchandise': 'products',
    'user-upload': 'user-content',
    'content': 'content',
  };
  
  return buckets[category];
}

/**
 * Get conversion preset for category
 */
function getPresetForCategory(category: ImageCategory): keyof typeof CONVERSION_PRESETS {
  const presets: Record<ImageCategory, keyof typeof CONVERSION_PRESETS> = {
    'event-hero': 'eventHero',
    'artist-photo': 'artistPhoto',
    'merchandise': 'merchandise',
    'user-upload': 'userUpload',
    'content': 'artistPhoto', // Use artist photo preset for general content
  };
  
  return presets[category];
}

/**
 * Upload image to Supabase Storage with automatic B&W conversion
 */
export async function uploadImage(
  file: File,
  path: string,
  options: UploadOptions
): Promise<UploadResult> {
  const supabase = await createClient();
  const bucket = getBucketForCategory(options.category);
  
  let fileToUpload: File | Blob = file;
  
  // Convert to B&W if requested (default: true)
  if (options.convertToBW !== false) {
    const conversionOptions = options.conversionOptions || 
      CONVERSION_PRESETS[getPresetForCategory(options.category)];
    
    const convertedDataUrl = await convertToMonochrome(file, conversionOptions);
    
    // Convert data URL back to Blob
    const response = await fetch(convertedDataUrl);
    fileToUpload = await response.blob();
  }
  
  // Upload main image
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, fileToUpload, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);
  
  const result: UploadResult = {
    url: urlData.publicUrl,
    path: data.path,
  };
  
  // Generate multiple sizes if requested
  if (options.generateSizes) {
    const sizes = options.sizes || [400, 800, 1200, 1600];
    const conversionOptions = options.conversionOptions || 
      CONVERSION_PRESETS[getPresetForCategory(options.category)];
    
    const resizedImages = await convertAndResize(file, sizes, conversionOptions);
    result.sizes = {};
    
    // Upload each size
    for (const [size, dataUrl] of Object.entries(resizedImages)) {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      const sizePath = path.replace(/(\.[^.]+)$/, `-${size}$1`);
      
      const { data: sizeData, error: sizeError } = await supabase.storage
        .from(bucket)
        .upload(sizePath, blob, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (!sizeError && sizeData) {
        const { data: sizeUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(sizeData.path);
        
        result.sizes[parseInt(size)] = sizeUrlData.publicUrl;
      }
    }
  }
  
  return result;
}

/**
 * Update existing image (replace with B&W version)
 */
export async function updateImage(
  bucket: string,
  path: string,
  file: File,
  conversionOptions?: ConversionOptions
): Promise<string> {
  const supabase = await createClient();
  
  // Convert to B&W
  const convertedDataUrl = await convertToMonochrome(file, conversionOptions);
  const response = await fetch(convertedDataUrl);
  const blob = await response.blob();
  
  // Upload with upsert
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, {
      cacheControl: '3600',
      upsert: true,
    });
  
  if (error) {
    throw new Error(`Failed to update image: ${error.message}`);
  }
  
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);
  
  return urlData.publicUrl;
}

/**
 * Delete image and all its sizes
 */
export async function deleteImage(
  bucket: string,
  path: string,
  sizes?: number[]
): Promise<void> {
  const supabase = await createClient();
  
  const pathsToDelete = [path];
  
  // Add size variants
  if (sizes) {
    sizes.forEach(size => {
      const sizePath = path.replace(/(\.[^.]+)$/, `-${size}$1`);
      pathsToDelete.push(sizePath);
    });
  }
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove(pathsToDelete);
  
  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Get image URL from storage
 */
export async function getImageUrl(
  bucket: string,
  path: string
): Promise<string> {
  const supabase = await createClient();
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * List images in a bucket
 */
export async function listImages(
  bucket: string,
  folder?: string
): Promise<Array<{ name: string; path: string; url: string }>> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder);
  
  if (error) {
    throw new Error(`Failed to list images: ${error.message}`);
  }
  
  return data.map(file => {
    const path = folder ? `${folder}/${file.name}` : file.name;
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return {
      name: file.name,
      path,
      url: urlData.publicUrl,
    };
  });
}

/**
 * Batch convert existing images to B&W
 */
export async function batchConvertExistingImages(
  bucket: string,
  paths: string[],
  conversionOptions?: ConversionOptions
): Promise<Array<{ path: string; url: string; success: boolean; error?: string }>> {
  const results = [];
  
  for (const path of paths) {
    try {
      const url = await getImageUrl(bucket, path);
      
      // Download image
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], path);
      
      // Convert and re-upload
      const newUrl = await updateImage(bucket, path, file, conversionOptions);
      
      results.push({
        path,
        url: newUrl,
        success: true,
      });
    } catch (error) {
      results.push({
        path,
        url: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  return results;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(sizes: Record<number, string>): string {
  return Object.entries(sizes)
    .map(([size, url]) => `${url} ${size}w`)
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizesAttribute(breakpoints: Record<string, string>): string {
  return Object.entries(breakpoints)
    .map(([query, size]) => `${query} ${size}`)
    .join(', ');
}

/**
 * Helper: Upload event hero image
 */
export async function uploadEventHero(
  file: File,
  eventId: string
): Promise<UploadResult> {
  const path = `events/${eventId}/hero-${Date.now()}.png`;
  
  return uploadImage(file, path, {
    category: 'event-hero',
    generateSizes: true,
    sizes: [800, 1200, 1600, 2400],
  });
}

/**
 * Helper: Upload artist photo
 */
export async function uploadArtistPhoto(
  file: File,
  artistId: string
): Promise<UploadResult> {
  const path = `artists/${artistId}/photo-${Date.now()}.png`;
  
  return uploadImage(file, path, {
    category: 'artist-photo',
    generateSizes: true,
    sizes: [400, 800, 1200],
  });
}

/**
 * Helper: Upload product image
 */
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<UploadResult> {
  const path = `products/${productId}/image-${Date.now()}.png`;
  
  return uploadImage(file, path, {
    category: 'merchandise',
    generateSizes: true,
    sizes: [400, 800, 1200],
  });
}

/**
 * Helper: Upload user avatar
 */
export async function uploadUserAvatar(
  file: File,
  userId: string
): Promise<UploadResult> {
  const path = `user-content/${userId}/avatar-${Date.now()}.png`;
  
  return uploadImage(file, path, {
    category: 'user-upload',
    generateSizes: true,
    sizes: [100, 200, 400],
  });
}
