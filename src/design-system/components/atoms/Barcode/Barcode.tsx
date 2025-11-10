/**
 * Barcode Component
 * GHXSTSHIP Entertainment Platform - Linear barcode display
 * High-contrast B&W barcode for ticket validation
 */

'use client';

import * as React from 'react';
import styles from './Barcode.module.css';

export type BarcodeFormat = 'code128' | 'ean13' | 'upc';
export type BarcodeSize = 'sm' | 'md' | 'lg';

export interface BarcodeProps {
  value: string;
  format?: BarcodeFormat;
  size?: BarcodeSize;
  showValue?: boolean;
  className?: string;
}

export const Barcode = React.forwardRef<HTMLDivElement, BarcodeProps>(
  (
    {
      value,
      format = 'code128',
      size = 'md',
      showValue = true,
      className = '',
    },
    ref
  ) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
      if (canvasRef.current && typeof window !== 'undefined') {
        // Barcode generation would use a library like jsbarcode
        // For now, placeholder implementation with geometric bars
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw simple barcode pattern
          ctx.fillStyle = '#000000';
          for (let i = 0; i < 50; i++) {
            const width = Math.random() > 0.5 ? 2 : 4;
            const x = i * 8;
            ctx.fillRect(x, 0, width, canvas.height);
          }
        }
      }
    }, [value, format]);

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
          width={400}
          height={100}
          aria-label={`Barcode: ${value}`}
        />
        {showValue && (
          <span className={styles.value}>{value}</span>
        )}
      </div>
    );
  }
);

Barcode.displayName = 'Barcode';
