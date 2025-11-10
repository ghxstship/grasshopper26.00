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
import styles from './QRScanner.module.css';

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
      <CardContent className={styles.content}>
        <div className={styles.container}>
          {/* Video Preview */}
          <div className={styles.videoContainer}>
            <video
              ref={videoRef}
              className={styles.video}
              style={{ display: isScanning ? 'block' : 'none' }}
              aria-label="QR code scanner video feed"
            >
              <track kind="captions" label="No captions available" />
            </video>
            
            {!isScanning && (
              <div className={styles.placeholder}>
                <div className={styles.placeholderContent}>
                  <Camera className={styles.placeholderIcon} />
                  <p className={styles.placeholderTitle}>Camera Ready</p>
                  <p className={styles.placeholderText}>Click start to begin scanning</p>
                </div>
              </div>
            )}

            {/* Scanning Overlay */}
            {isScanning && (
              <div className={styles.scanningOverlay}>
                <div className={styles.scanningBorder} />
                <div className={styles.scanningFrame}>
                  <div className={styles.scanningFrameBox} />
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle className={styles.errorIcon} />
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Permission Denied Message */}
          {hasPermission === false && (
            <div className={styles.permissionWarning}>
              <p className={styles.permissionTitle}>
                <strong>Camera access denied.</strong>
              </p>
              <p className={styles.permissionText}>
                Please enable camera permissions in your browser settings to use the QR scanner.
              </p>
            </div>
          )}

          {/* Controls */}
          <div className={styles.controls}>
            {!isScanning ? (
              <Button
                onClick={startScanning}
                disabled={disabled || hasPermission === false}
                className={styles.controlButton}
              >
                <Camera className={styles.buttonIcon} />
                Start Scanning
              </Button>
            ) : (
              <Button
                onClick={stopScanning}
                variant="destructive"
                className={styles.controlButton}
              >
                <CameraOff className={styles.buttonIcon} />
                Stop Scanning
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className={styles.instructions}>
            <p>• Position the QR code within the frame</p>
            <p>• Ensure good lighting for best results</p>
            <p>• The scanner will automatically detect codes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
