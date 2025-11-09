/**
 * QR Scanner Component
 * Mobile-optimized QR code scanner for ticket check-in
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent } from '@/design-system/components/atoms/card';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

export function QRScanner({ onScan, onError, disabled = false }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    // Initialize code reader
    codeReaderRef.current = new BrowserMultiFormatReader();

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      setHasPermission(true);
      setIsScanning(true);

      if (!videoRef.current || !codeReaderRef.current) return;

      // Start decoding from video stream
      codeReaderRef.current.decodeFromVideoDevice(
        null, // Use default camera
        videoRef.current,
        (result, error) => {
          if (result) {
            const text = result.getText();
            onScan(text);
            // Continue scanning for next code
          }
          if (error && !(error instanceof NotFoundException)) {
            console.error('QR scan error:', error);
          }
        }
      );
    } catch (err: any) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      setError(err.message || 'Failed to access camera');
      setIsScanning(false);
      onError?.(err);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Video Preview */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ display: isScanning ? 'block' : 'none' }}
              aria-label="QR code scanner video feed"
            >
              <track kind="captions" label="No captions available" />
            </video>
            
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Camera Ready</p>
                  <p className="text-sm opacity-75">Click start to begin scanning</p>
                </div>
              </div>
            )}

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-4 border-primary/50 rounded-lg animate-pulse" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-64 h-64 border-4 border-white rounded-lg" />
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Permission Denied Message */}
          {hasPermission === false && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Camera access denied.</strong>
              </p>
              <p className="text-xs text-yellow-700">
                Please enable camera permissions in your browser settings to use the QR scanner.
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {!isScanning ? (
              <Button
                onClick={startScanning}
                disabled={disabled || hasPermission === false}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Scanning
              </Button>
            ) : (
              <Button
                onClick={stopScanning}
                variant="destructive"
                className="flex-1"
              >
                <CameraOff className="h-4 w-4 mr-2" />
                Stop Scanning
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Position the QR code within the frame</p>
            <p>• Ensure good lighting for best results</p>
            <p>• The scanner will automatically detect codes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
