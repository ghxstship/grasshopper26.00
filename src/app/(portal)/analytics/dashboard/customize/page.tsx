/**
 * Dashboard Customization Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { kpiAnalyticsService } from '@/lib/services/kpi-analytics.service';
import type { KPIMetric, UserDashboard } from '@/types/kpi';
import styles from './page.module.css';

export default function CustomizeDashboardPage() {
  const [metrics, setMetrics] = useState<KPIMetric[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [dashboardName, setDashboardName] = useState('My Dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await kpiAnalyticsService.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleSave = async () => {
    try {
      await kpiAnalyticsService.saveDashboard({
        user_id: 'current-user-id',
        dashboard_name: dashboardName,
        layout_config: { layout: 'grid', widgets: [] },
        metrics_displayed: selectedMetrics,
        filters_config: {},
        refresh_interval: 60,
        is_default: false,
      });
    } catch (error) {
      console.error('Failed to save dashboard:', error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Customize Dashboard</h1>
        <button
          type="button"
          className={styles.saveButton}
          onClick={handleSave}
          disabled={selectedMetrics.length === 0}
        >
          Save Dashboard
        </button>
      </header>

      <div className={styles.nameSection}>
        <label htmlFor="dashboard-name" className={styles.label}>
          Dashboard Name
        </label>
        <input
          id="dashboard-name"
          type="text"
          className={styles.input}
          value={dashboardName}
          onChange={(e) => setDashboardName(e.target.value)}
        />
      </div>

      <div className={styles.metricsSection}>
        <h2 className={styles.sectionTitle}>Select Metrics</h2>
        {loading ? (
          <div className={styles.loading}>Loading metrics...</div>
        ) : (
          <div className={styles.metricsGrid}>
            {metrics.map((metric) => (
              <label key={metric.id} className={styles.metricOption}>
                <input
                  type="checkbox"
                  checked={selectedMetrics.includes(metric.id)}
                  onChange={() => toggleMetric(metric.id)}
                  className={styles.checkbox}
                />
                <span className={styles.metricLabel}>{metric.metric_name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
