'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { queueOfflineCheckIn, getPendingCheckInCount, syncOfflineCheckIns } from '@/lib/offline/check-in-queue';
import { Wifi, WifiOff, Upload } from 'lucide-react';
import jsQR from 'jsqr';
import styles from './QRScanner.module.css';

export interface QRScannerProps {
  eventId: string;
  onScan?: (data: string) => void;
  onOfflineScan?: (qrCode: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ eventId, onScan, onOfflineScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);
    setPendingCount(getPendingCheckInCount());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasCamera(true);
        setError(null);
        scanQRCode();
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Camera access denied. Please enable camera permissions.');
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    let lastScannedCode: string | null = null;
    let lastScanTime = 0;
    const SCAN_COOLDOWN = 2000; // 2 seconds between scans of same code

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          const now = Date.now();
          // Prevent duplicate scans of the same code within cooldown period
          if (code.data !== lastScannedCode || (now - lastScanTime) > SCAN_COOLDOWN) {
            lastScannedCode = code.data;
            lastScanTime = now;
            handleManualInput(code.data);
          }
        }
      }

      requestAnimationFrame(scan);
    };

    scan();
  };

  const handleManualInput = (qrCode: string) => {
    if (!isOnline) {
      // Queue for offline sync
      queueOfflineCheckIn({
        ticketId: '', // Will be resolved on sync
        qrCode,
        eventId,
        scannedAt: new Date().toISOString(),
        scannedBy: '', // Will be set from auth context
      });
      setPendingCount(getPendingCheckInCount());
      onOfflineScan?.(qrCode);
    } else {
      onScan?.(qrCode);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncOfflineCheckIns();
      setPendingCount(getPendingCheckInCount());
      console.log('Sync result:', result);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.status}>
          {isOnline ? (
            <div className={styles.online}>
              <Wifi size={16} />
              <span>Online</span>
            </div>
          ) : (
            <div className={styles.offline}>
              <WifiOff size={16} />
              <span>Offline Mode</span>
            </div>
          )}
        </div>
        
        {pendingCount > 0 && (
          <button
            onClick={handleSync}
            disabled={!isOnline || isSyncing}
            className={styles.syncButton}
          >
            <Upload size={16} />
            <span>Sync {pendingCount} pending</span>
          </button>
        )}
      </div>

      {error ? (
        <div className={styles.error}>
          <Typography variant="body">{error}</Typography>
        </div>
      ) : (
        <div className={styles.scanner}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.video}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {!hasCamera && (
            <div className={styles.placeholder}>
              <Typography variant="body">Initializing camera...</Typography>
            </div>
          )}
        </div>
      )}

      {!isOnline && (
        <div className={styles.offlineNotice}>
          <Typography variant="body">
            Scans will be queued and synced when connection is restored
          </Typography>
        </div>
      )}
    </div>
  );
};
