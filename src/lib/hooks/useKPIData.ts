/**
 * KPI Data Hook
 * React hook for fetching and managing KPI data with real-time updates
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { kpiAnalyticsService } from '@/lib/services/kpi-analytics.service';
import type { MetricCard, KPIInsight, DashboardDataResponse } from '@/types/kpi';

interface UseKPIDataOptions {
  eventId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealtime?: boolean;
}

interface UseKPIDataReturn {
  metrics: MetricCard[];
  insights: KPIInsight[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
}

export function useKPIData(options: UseKPIDataOptions = {}): UseKPIDataReturn {
  const {
    eventId,
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute default
    enableRealtime = true,
  } = options;

  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [insights, setInsights] = useState<KPIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await kpiAnalyticsService.getDashboardData({
        event_id: eventId,
        include_trends: true,
        include_targets: true,
      });

      setMetrics(data.metrics);
      setInsights(data.insights);
      setLastUpdated(data.last_updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load KPI data');
      console.error('KPI data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchData();
  }, [fetchData]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !eventId) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, eventId, refreshInterval, fetchData]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealtime || !eventId) return;

    const subscription = kpiAnalyticsService.subscribeToKPIUpdates(
      eventId,
      () => {
        fetchData();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [enableRealtime, eventId, fetchData]);

  return {
    metrics,
    insights,
    loading,
    error,
    lastUpdated,
    refresh,
  };
}
