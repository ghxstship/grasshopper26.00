/**
 * Bar Chart Component (Molecule)
 * Comparison and categorical data visualization
 * Uses Recharts library with GHXSTSHIP design system
 */

'use client';

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import type { BarChartData } from '@/types/kpi';

interface BarChartProps {
  title: string;
  subtitle?: string;
  data: BarChartData;
  height?: number;
  loading?: boolean;
  error?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  horizontal?: boolean;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  title,
  subtitle,
  data,
  height = 300,
  loading = false,
  error,
  showGrid = true,
  showLegend = true,
  horizontal = false,
  className,
}) => {
  // Transform data for Recharts
  const chartData = data.labels.map((label, index) => {
    const point: Record<string, any> = { name: label };
    data.datasets.forEach((dataset) => {
      point[dataset.label] = dataset.data[index];
    });
    return point;
  });

  // Color palette from design system
  const colors = [
    'var(--color-primary-500)',
    'var(--color-secondary-500)',
    'var(--color-accent-500)',
    'var(--color-success-500)',
    'var(--color-warning-500)',
    'var(--color-info-500)',
  ];

  const ChartComponent = horizontal ? RechartsBarChart : RechartsBarChart;

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      height={height}
      loading={loading}
      error={error}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={chartData}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-subtle)"
              opacity={0.5}
            />
          )}
          {horizontal ? (
            <>
              <XAxis
                type="number"
                stroke="var(--color-text-secondary)"
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontFamily: 'var(--font-family-base)',
                }}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="var(--color-text-secondary)"
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontFamily: 'var(--font-family-base)',
                }}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                stroke="var(--color-text-secondary)"
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontFamily: 'var(--font-family-base)',
                }}
              />
              <YAxis
                stroke="var(--color-text-secondary)"
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontFamily: 'var(--font-family-base)',
                }}
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface-primary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-sm)',
              fontSize: 'var(--font-size-sm)',
            }}
            labelStyle={{
              color: 'var(--color-text-primary)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-base)',
              }}
            />
          )}
          {data.datasets.map((dataset, index) => (
            <Bar
              key={dataset.label}
              dataKey={dataset.label}
              fill={
                dataset.backgroundColor?.[0] || colors[index % colors.length]
              }
              radius={[4, 4, 0, 0]}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
