/**
 * Chart Container Component (Molecule)
 * Reusable wrapper for all chart visualizations
 * GHXSTSHIP Contemporary Minimal Pop Art aesthetic
 */

'use client';

import React from 'react';
import styles from './ChartContainer.module.css';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  height?: number | string;
  loading?: boolean;
  error?: string;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  actions,
  height = 300,
  loading = false,
  error,
  className,
}) => {
  const containerStyle = {
    '--chart-height': typeof height === 'number' ? `${height}px` : height,
  } as React.CSSProperties;

  return (
    <div className={`${styles.container} ${className || ''}`} style={containerStyle}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      {/* Chart Content */}
      <div className={styles.chartWrapper}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Loading chart data...</p>
          </div>
        )}

        {error && !loading && (
          <div className={styles.errorOverlay}>
            <div className={styles.errorIcon}>⚠️</div>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className={styles.chartContent}>{children}</div>
        )}
      </div>
    </div>
  );
};
