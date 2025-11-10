/**
 * Pie Chart Component (Molecule)
 * Distribution and proportion visualization
 * Uses Recharts library with GHXSTSHIP design system
 */

'use client';

import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import type { PieChartData } from '@/types/kpi';

interface PieChartProps {
  title: string;
  subtitle?: string;
  data: PieChartData;
  height?: number;
  loading?: boolean;
  error?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  innerRadius?: number;
  className?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  title,
  subtitle,
  data,
  height = 300,
  loading = false,
  error,
  showLegend = true,
  showLabels = true,
  innerRadius = 0,
  className,
}) => {
  // Transform data for Recharts
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0].data[index],
  }));

  // Color palette from design system
  const colors = data.datasets[0].backgroundColor || [
    'var(--color-primary-500)',
    'var(--color-secondary-500)',
    'var(--color-accent-500)',
    'var(--color-success-500)',
    'var(--color-warning-500)',
    'var(--color-info-500)',
    'var(--color-error-500)',
    'var(--color-primary-300)',
    'var(--color-secondary-300)',
    'var(--color-accent-300)',
  ];

  const renderLabel = (entry: any) => {
    if (!showLabels) return null;
    const percent = ((entry.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
    return `${entry.name}: ${percent}%`;
  };

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
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={showLabels}
            label={renderLabel}
            outerRadius={80}
            innerRadius={innerRadius}
            fill="var(--color-primary-500)"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
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
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
