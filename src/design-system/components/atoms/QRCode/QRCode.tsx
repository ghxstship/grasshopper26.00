/**
 * QRCode Component
 * GHXSTSHIP Entertainment Platform - Ticket QR codes
 * High-contrast B&W QR codes for ticket validation
 */

'use client';

import * as React from 'react';
import styles from './QRCode.module.css';

export type QRCodeSize = 'sm' | 'md' | 'lg' | 'xl';

export interface QRCodeProps {
  value: string;
  size?: QRCodeSize;
  label?: string;
  className?: string;
}

export const QRCode = React.forwardRef<HTMLDivElement, QRCodeProps>(
  (
    {
      value,
      size = 'md',
      label,
      className = '',
    },
    ref
  ) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
      if (canvasRef.current && typeof window !== 'undefined') {
        // QR code generation would use a library like qrcode
        // For now, placeholder implementation
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(value.slice(0, 10), 10, 50);
        }
      }
    }, [value]);

    const containerClassNames = [
      styles.container,
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={256}
          height={256}
          aria-label={label || `QR code for ${value}`}
        />
        {label && (
          <span className={styles.label}>{label}</span>
        )}
      </div>
    );
  }
);

QRCode.displayName = 'QRCode';
