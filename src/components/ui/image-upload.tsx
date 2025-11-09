/* eslint-disable no-magic-numbers, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
// File size constants and interactive upload area
'use client';

import { useState, useRef } from 'react';
import { Button } from './button';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

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
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-purple-500/20">
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
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-64 border-2 border-dashed border-purple-500/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="h-12 w-12 text-purple-400 animate-spin mb-4" />
              <p className="text-gray-400">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-purple-400 mb-4" />
              <p className="text-gray-400 mb-2">Click to upload image</p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
