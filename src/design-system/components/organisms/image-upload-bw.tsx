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
import styles from './image-upload-bw.module.css';

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
    <div className={cn(styles.container, className)}>
      {/* File Input */}
      <div className={styles.uploadBox}>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className={styles.fileInput}
          id="image-upload-bw"
        />
        
        <label
          htmlFor="image-upload-bw"
          className={styles.uploadLabel}
          aria-label="Upload image for B&W conversion"
        >
          <div className={styles.uploadArea}>
            <p className={styles.uploadTitle}>
              SELECT IMAGE
            </p>
            <p className={styles.uploadDescription}>
              Image will be automatically converted to B&W
            </p>
            <p className={styles.uploadMeta}>
              Max size: {maxSize}MB | Formats: JPG, PNG, WEBP
            </p>
          </div>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorBox}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {/* Converting State */}
      {isConverting && (
        <div className={styles.convertingBox}>
          <div className={styles.convertingContent}>
            <LoadingSpinner size="md" />
            <p className={styles.convertingText}>
              CONVERTING TO B&W...
            </p>
          </div>
        </div>
      )}

      {/* Preview */}
      {showPreview && preview && !isConverting && (
        <div className={styles.previewContainer}>
          <div className={styles.previewGrid}>
            {/* Original */}
            {originalPreview && (
              <div className={styles.previewBox}>
                <div className={styles.previewHeader}>
                  <p className={styles.previewTitle}>
                    ORIGINAL
                  </p>
                </div>
                <div className={styles.previewImage}>
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
            <div className={styles.previewBox}>
              <div className={styles.previewHeaderConverted}>
                <p className={styles.previewTitle}>
                  B&W CONVERTED
                </p>
              </div>
              <div className={styles.previewImage}>
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
          <div className={styles.actionButtons}>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={styles.uploadButton}
            >
              {isUploading ? (
                <span className={styles.uploadButtonContent}>
                  <LoadingSpinner size="sm" />
                  UPLOADING...
                </span>
              ) : (
                <span className={styles.uploadButtonContent}>
                  <CheckIcon size={20} />
                  UPLOAD IMAGE
                </span>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={isUploading}
              className={styles.cancelButton}
            >
              <span className={styles.cancelButtonContent}>
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
        className={styles.fileInput}
        id="quick-image-upload"
        disabled={isUploading}
      />
      
      <button
        type="button"
        disabled={isUploading}
        className={styles.quickUploadButton}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Upload image"
      >
        {isUploading ? (
          <span className={styles.quickUploadContent}>
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
