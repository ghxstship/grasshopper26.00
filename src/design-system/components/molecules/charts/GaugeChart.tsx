/**
 * Gauge Chart Component (Molecule)
 * Progress and goal visualization
 * Custom SVG implementation with GHXSTSHIP design system
 */

'use client';

import React from 'react';
import { ChartContainer } from './ChartContainer';
import type { GaugeChartData } from '@/types/kpi';
import styles from './GaugeChart.module.css';

interface GaugeChartProps {
  title: string;
  subtitle?: string;
  data: GaugeChartData;
  height?: number;
  loading?: boolean;
  error?: string;
  showValue?: boolean;
  showTarget?: boolean;
  className?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  title,
  subtitle,
  data,
  height = 300,
  loading = false,
  error,
  showValue = true,
  showTarget = true,
  className,
}) => {
  const { value, min, max, target, thresholds } = data;

  // Calculate percentage
  const percentage = ((value - min) / (max - min)) * 100;
  const targetPercentage = target ? ((target - min) / (max - min)) * 100 : null;

  // Determine color based on thresholds
  const getColor = () => {
    if (!thresholds || thresholds.length === 0) {
      return 'var(--color-primary-500)';
    }

    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (value >= thresholds[i].value) {
        return thresholds[i].color;
      }
    }

    return thresholds[0].color;
  };

  const color = getColor();

  // SVG gauge parameters
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      height={height}
      loading={loading}
      error={error}
      className={className}
    >
      <div className={styles.gaugeContainer}>
        <svg
          width={size}
          height={size / 2 + 40}
          viewBox={`0 0 ${size} ${size / 2 + 40}`}
          className={styles.gaugeSvg}
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="var(--color-border-subtle)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Value arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={styles.gaugeArc}
          />

          {/* Target marker */}
          {showTarget && targetPercentage !== null && (
            <g>
              <line
                x1={size / 2 + radius * Math.cos((Math.PI * targetPercentage) / 100 - Math.PI)}
                y1={size / 2 + radius * Math.sin((Math.PI * targetPercentage) / 100 - Math.PI)}
                x2={size / 2 + (radius + 15) * Math.cos((Math.PI * targetPercentage) / 100 - Math.PI)}
                y2={size / 2 + (radius + 15) * Math.sin((Math.PI * targetPercentage) / 100 - Math.PI)}
                stroke="var(--color-warning-500)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          )}
        </svg>

        {/* Value display */}
        {showValue && (
          <div className={styles.valueDisplay}>
            <div className={styles.currentValue} style={{ color }}>
              {value.toFixed(1)}
            </div>
            <div className={styles.range}>
              {min} - {max}
            </div>
            {showTarget && target && (
              <div className={styles.targetValue}>
                Target: {target}
              </div>
            )}
          </div>
        )}
      </div>
    </ChartContainer>
  );
};
