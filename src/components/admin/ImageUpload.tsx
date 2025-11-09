'use client';

import { useState, useRef } from 'react';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent } from '@/design-system/components/atoms/card';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ImageUploadProps {
  eventId: string;
  type: 'hero' | 'gallery';
  currentImage?: string;
  onUploadComplete?: (imageUrl: string) => void;
}

export default function ImageUpload({ eventId, type, currentImage, onUploadComplete }: ImageUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImage);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image must be less than 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`/api/admin/events/${eventId}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
      setPreview(null);
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });

      if (onUploadComplete) {
        onUploadComplete(data.imageUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setImageUrl(undefined);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">
              {type === 'hero' ? 'Hero Image' : 'Gallery Image'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {type === 'hero' 
                ? 'Main event image displayed on event pages (recommended: 1920x1080px)'
                : 'Additional images for the event gallery'
              }
            </p>
          </div>

          {(imageUrl || preview) && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <Image
                src={preview || imageUrl || ''}
                alt={type === 'hero' ? 'Hero image' : 'Gallery image'}
                fill
                className="object-cover"
              />
              {!uploading && (
                <button
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
          )}

          {!imageUrl && !preview && (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                No image uploaded yet
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {imageUrl ? 'Change Image' : 'Upload Image'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
