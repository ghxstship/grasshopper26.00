/**
 * Image Upload Component with Automatic B&W Conversion
 * GHXSTSHIP compliant image uploader
 */

'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { convertToMonochrome, ConversionMode, CONVERSION_PRESETS } from '@/lib/imageProcessing/convert';
import { LoadingSpinner } from '@/design-system/components/atoms/loading';
import { CheckIcon, CloseIcon } from '@/design-system/components/atoms/icons/geometric-icons';

interface ImageUploadBWProps {
  onUpload: (file: File, convertedDataUrl: string) => Promise<void>;
  category?: keyof typeof CONVERSION_PRESETS;
  conversionMode?: ConversionMode;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  showPreview?: boolean;
  className?: string;
}

export function ImageUploadBW({
  onUpload,
  category = 'artistPhoto',
  conversionMode,
  maxSize = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  showPreview = true,
  className,
}: ImageUploadBWProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setError(null);
    setPreview(null);
    setOriginalPreview(null);
    setSelectedFile(null);

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      setError(`Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`);
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    setSelectedFile(file);

    // Show original preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Convert to B&W
    setIsConverting(true);
    try {
      const options = conversionMode 
        ? { mode: conversionMode }
        : CONVERSION_PRESETS[category];
      
      const convertedDataUrl = await convertToMonochrome(file, options);
      setPreview(convertedDataUrl);
    } catch (err) {
      setError('Failed to convert image to B&W');
      console.error(err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !preview) return;

    setIsUploading(true);
    setError(null);

    try {
      await onUpload(selectedFile, preview);
      
      // Reset after successful upload
      setPreview(null);
      setOriginalPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setOriginalPreview(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* File Input */}
      <div className="border-3 border-black p-6 bg-white">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload-bw"
        />
        
        <label
          htmlFor="image-upload-bw"
          className="block cursor-pointer"
          aria-label="Upload image for B&W conversion"
        >
          <div className="border-3 border-black p-8 text-center hover:bg-grey-100 transition-colors">
            <p className="font-bebas text-h4 uppercase mb-2">
              SELECT IMAGE
            </p>
            <p className="font-share text-body text-grey-600">
              Image will be automatically converted to B&W
            </p>
            <p className="font-share-mono text-meta text-grey-500 mt-2">
              Max size: {maxSize}MB | Formats: JPG, PNG, WEBP
            </p>
          </div>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="border-3 border-black bg-grey-100 p-4">
          <p className="font-share text-body text-black">{error}</p>
        </div>
      )}

      {/* Converting State */}
      {isConverting && (
        <div className="border-3 border-black p-6 bg-white">
          <div className="flex items-center justify-center gap-4">
            <LoadingSpinner size="md" />
            <p className="font-bebas text-h5 uppercase">
              CONVERTING TO B&W...
            </p>
          </div>
        </div>
      )}

      {/* Preview */}
      {showPreview && preview && !isConverting && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Original */}
            {originalPreview && (
              <div className="border-3 border-black">
                <div className="bg-grey-900 p-2">
                  <p className="font-bebas text-body uppercase text-white">
                    ORIGINAL
                  </p>
                </div>
                <div className="aspect-square bg-grey-200 flex items-center justify-center overflow-hidden relative">
                  <Image
                    src={originalPreview}
                    alt="Original"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}

            {/* Converted */}
            <div className="border-3 border-black">
              <div className="bg-black p-2">
                <p className="font-bebas text-body uppercase text-white">
                  B&W CONVERTED
                </p>
              </div>
              <div className="aspect-square bg-grey-200 flex items-center justify-center overflow-hidden relative">
                <Image
                  src={preview}
                  alt="Converted"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-black text-white border-3 border-black px-6 py-4 font-bebas text-h5 uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  UPLOADING...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckIcon size={20} />
                  UPLOAD IMAGE
                </span>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="bg-white text-black border-3 border-black px-6 py-4 font-bebas text-h5 uppercase hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                <CloseIcon size={20} />
                CANCEL
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Simplified version for quick uploads
 */
interface QuickImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  buttonText?: string;
  className?: string;
}

export function QuickImageUpload({
  onUpload,
  buttonText = 'UPLOAD IMAGE',
  className,
}: QuickImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="quick-image-upload"
        disabled={isUploading}
      />
      
      <button
        type="button"
        disabled={isUploading}
        className="bg-black text-white border-3 border-black px-6 py-3 font-bebas text-h6 uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Upload image"
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            UPLOADING...
          </span>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
}
