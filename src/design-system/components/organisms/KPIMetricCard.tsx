/**
 * KPI Metric Card Component
 * Displays a single KPI metric with trend, target, and visualization
 * GHXSTSHIP Contemporary Minimal Pop Art aesthetic
 */

'use client';

import React from 'react';
import type { MetricCard, TrendDirection } from '@/types/kpi';
import styles from './KPIMetricCard.module.css';

interface KPIMetricCardProps {
  metricCard: MetricCard;
  size?: 'small' | 'medium' | 'large';
  showTrend?: boolean;
  showTarget?: boolean;
  showSparkline?: boolean;
  onClick?: () => void;
  className?: string;
}

export const KPIMetricCard: React.FC<KPIMetricCardProps> = ({
  metricCard,
  size = 'medium',
  showTrend = true,
  showTarget = true,
  showSparkline = false,
  onClick,
  className,
}) => {
  const {
    metric,
    current_value,
    trend,
    percentage_change,
    target_value,
    visualization,
  } = metricCard;

  const formattedValue = formatValue(current_value, metric.unit_of_measurement);
  const formattedTarget = target_value
    ? formatValue(target_value, metric.unit_of_measurement)
    : null;

  const trendIcon = getTrendIcon(trend);
  const trendColor = getTrendColor(trend);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`${styles.card} ${styles[size]} ${className || ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.category}>{formatCategory(metric.metric_category)}</span>
        {metric.is_core_metric && <span className={styles.coreBadge}>Core</span>}
      </div>

      {/* Metric Name */}
      <h3 className={styles.metricName}>{metric.metric_name}</h3>

      {/* Value Display */}
      <div className={styles.valueContainer}>
        <div className={styles.mainValue}>{formattedValue}</div>

        {/* Trend Indicator */}
        {showTrend && trend !== 'unknown' && (
          <div className={`${styles.trendIndicator} ${styles[`trend-${trend}`]}`}>
            <span className={styles.trendIcon}>{trendIcon}</span>
            {percentage_change !== null && (
              <span className={styles.trendValue}>
                {Math.abs(percentage_change).toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Target Comparison */}
      {showTarget && formattedTarget && (
        <div className={styles.targetContainer}>
          <span className={styles.targetLabel}>Target:</span>
          <span className={styles.targetValue}>{formattedTarget}</span>
        </div>
      )}

      {/* Sparkline */}
      {showSparkline && metricCard.sparkline_data && (
        <div className={styles.sparklineContainer}>
          <Sparkline data={metricCard.sparkline_data} trend={trend} />
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.comparisonPeriod}>{metricCard.comparison_period}</span>
      </div>
    </div>
  );
};

// =====================================================
// SPARKLINE COMPONENT
// =====================================================

interface SparklineProps {
  data: number[];
  trend: TrendDirection;
}

const Sparkline: React.FC<SparklineProps> = ({ data, trend }) => {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = getTrendColor(trend);

  return (
    <svg
      className={styles.sparkline}
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={`var(${strokeColor})`}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function formatValue(value: number, unit: string | null): string {
  if (unit === 'USD' || unit === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (unit === 'percentage') {
    return `${value.toFixed(1)}%`;
  }

  if (unit === 'count' || unit === 'number') {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (unit === 'hours') {
    return `${value.toFixed(1)}h`;
  }

  if (unit === 'days') {
    return `${value.toFixed(0)}d`;
  }

  if (unit === 'ratio') {
    return value.toFixed(2);
  }

  return value.toFixed(2);
}

function formatCategory(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getTrendIcon(trend: TrendDirection): string {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'stable':
      return '→';
    default:
      return '';
  }
}

function getTrendColor(trend: TrendDirection): string {
  switch (trend) {
    case 'up':
      return '--color-success-500';
    case 'down':
      return '--color-error-500';
    case 'stable':
      return '--color-neutral-400';
    default:
      return '--color-neutral-500';
  }
}
