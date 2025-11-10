/* eslint-disable no-magic-numbers, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
// File size constants and interactive upload area
'use client';

import { useState, useRef } from 'react';
import { Button } from './button';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import styles from './image-upload.module.css';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  bucket?: string;
}

export function ImageUpload({ onUpload, currentImage, bucket = 'event-images' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.url) {
        setPreview(data.url);
        onUpload(data.url);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className={styles.card}>
          <Image
            src={preview}
            alt="Upload preview"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className={styles.card}
          >
            <X className={styles.icon} />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={styles.row}
        >
          {uploading ? (
            <>
              <Loader2 className={styles.spinner} />
              <p className={styles.text}>Uploading...</p>
            </>
          ) : (
            <>
              <Upload className={styles.iconLarge} />
              <p className={styles.text}>Click to upload image</p>
              <p className={styles.text}>PNG, JPG, GIF up to 5MB</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
