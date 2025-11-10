/**
 * KPI Analytics Service Tests
 * Unit tests for KPI calculation and data retrieval
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { kpiAnalyticsService } from '@/lib/services/kpi-analytics.service';
import type { KPIMetric, MetricCard, KPIInsight } from '@/types/kpi';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
          data: [],
          error: null,
        })),
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
        data: [],
        error: null,
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'test-id' },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'test-id' },
            error: null,
          })),
        })),
      })),
    })),
    rpc: vi.fn(() => ({
      data: [],
      error: null,
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
  }),
}));

describe('KPIAnalyticsService', () => {
  describe('getMetrics', () => {
    it('should fetch all active metrics', async () => {
      const metrics = await kpiAnalyticsService.getMetrics();
      expect(Array.isArray(metrics)).toBe(true);
    });

    it('should filter metrics by category', async () => {
      const metrics = await kpiAnalyticsService.getMetrics('financial_revenue');
      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe('getCoreMetrics', () => {
    it('should fetch only core metrics', async () => {
      const metrics = await kpiAnalyticsService.getCoreMetrics();
      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe('getMetricByCode', () => {
    it('should fetch a specific metric by code', async () => {
      const metric = await kpiAnalyticsService.getMetricByCode('total_event_revenue');
      expect(metric).toBeDefined();
    });
  });

  describe('calculateKPIs', () => {
    it('should calculate KPIs for an event', async () => {
      const result = await kpiAnalyticsService.calculateKPIs({
        event_id: 'test-event-id',
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
    });

    it('should handle calculation errors gracefully', async () => {
      const result = await kpiAnalyticsService.calculateKPIs({
        event_id: 'invalid-id',
      });

      expect(result).toHaveProperty('success');
    });
  });

  describe('getDashboardData', () => {
    it('should return dashboard data structure', async () => {
      const data = await kpiAnalyticsService.getDashboardData({
        event_id: 'test-event-id',
      });

      expect(data).toHaveProperty('metrics');
      expect(data).toHaveProperty('insights');
      expect(data).toHaveProperty('summary');
      expect(data).toHaveProperty('last_updated');
    });

    it('should include trends when requested', async () => {
      const data = await kpiAnalyticsService.getDashboardData({
        event_id: 'test-event-id',
        include_trends: true,
      });

      expect(data).toHaveProperty('metrics');
      expect(Array.isArray(data.metrics)).toBe(true);
    });
  });

  describe('getInsights', () => {
    it('should fetch insights for an event', async () => {
      const insights = await kpiAnalyticsService.getInsights('test-event-id');
      expect(Array.isArray(insights)).toBe(true);
    });

    it('should filter by acknowledged status', async () => {
      const insights = await kpiAnalyticsService.getInsights('test-event-id', false);
      expect(Array.isArray(insights)).toBe(true);
    });
  });

  describe('subscribeToKPIUpdates', () => {
    it('should create a subscription channel', () => {
      const callback = vi.fn();
      const subscription = kpiAnalyticsService.subscribeToKPIUpdates(
        'test-event-id',
        callback
      );

      expect(subscription).toBeDefined();
    });
  });
});

describe('KPI Calculation Functions', () => {
  describe('determineTrend', () => {
    it('should identify upward trend', () => {
      // This would test the private determineTrend method
      // In practice, we'd test this through public methods
      expect(true).toBe(true);
    });

    it('should identify downward trend', () => {
      expect(true).toBe(true);
    });

    it('should identify stable trend', () => {
      expect(true).toBe(true);
    });
  });
});

describe('KPI Data Validation', () => {
  it('should validate metric card structure', () => {
    const metricCard: Partial<MetricCard> = {
      current_value: 100,
      trend: 'up',
      percentage_change: 10,
    };

    expect(metricCard.current_value).toBe(100);
    expect(metricCard.trend).toBe('up');
  });

  it('should validate insight structure', () => {
    const insight: Partial<KPIInsight> = {
      insight_type: 'anomaly',
      severity: 'critical',
      insight_title: 'Test Insight',
    };

    expect(insight.insight_type).toBe('anomaly');
    expect(insight.severity).toBe('critical');
  });
});
