/**
 * Insights Engine Service
 * AI-powered anomaly detection and recommendations
 */

import { kpiAnalyticsService } from './kpi-analytics.service';
import { createClient } from '@/lib/supabase/client';
import type { KPIInsight, KPIDataPoint } from '@/types/kpi';

export class InsightsEngineService {
  private supabase = createClient();

  async detectAnomalies(eventId: string): Promise<KPIInsight[]> {
    const insights: KPIInsight[] = [];
    
    // Get latest KPI data
    const latestKPIs = await kpiAnalyticsService.getEventKPILatest(eventId);
    
    for (const kpi of latestKPIs) {
      // Statistical anomaly detection
      if (kpi.variance_from_target_pct && Math.abs(kpi.variance_from_target_pct) > 20) {
        const insight = await this.createAnomalyInsight(eventId, kpi);
        if (insight) insights.push(insight);
      }
    }
    
    return insights;
  }

  async generatePredictions(eventId: string, metricCode: string): Promise<number[]> {
    // Get historical data
    const metric = await kpiAnalyticsService.getMetricByCode(metricCode);
    if (!metric) return [];
    
    const dataPoints = await kpiAnalyticsService.getKPIDataPoints(metric.id, eventId);
    
    // Simple linear regression for prediction
    return this.linearRegression(dataPoints.map(d => d.value));
  }

  async generateRecommendations(eventId: string): Promise<KPIInsight[]> {
    const insights: KPIInsight[] = [];
    const latestKPIs = await kpiAnalyticsService.getEventKPILatest(eventId);
    
    // Analyze sell-through rate
    const sellThrough = latestKPIs.find(k => k.metric_code === 'sell_through_rate');
    if (sellThrough && sellThrough.current_value < 50) {
      insights.push(await this.createRecommendationInsight(
        eventId,
        'Low Sell-Through Rate',
        'Ticket sales are below 50% of capacity',
        [
          'Consider launching a promotional campaign',
          'Offer early bird discounts',
          'Increase social media advertising',
          'Partner with local influencers'
        ]
      ));
    }
    
    // Analyze profit margin
    const profitMargin = latestKPIs.find(k => k.metric_code === 'profit_margin_percentage');
    if (profitMargin && profitMargin.current_value < 20) {
      insights.push(await this.createRecommendationInsight(
        eventId,
        'Low Profit Margin',
        'Profit margin is below industry standard of 25%',
        [
          'Review vendor contracts for cost savings',
          'Optimize staffing levels',
          'Increase VIP ticket pricing',
          'Add revenue streams (merchandise, F&B)'
        ]
      ));
    }
    
    return insights;
  }

  private async createAnomalyInsight(eventId: string, kpi: any): Promise<KPIInsight | null> {
    const severity = Math.abs(kpi.variance_from_target_pct) > 50 ? 'critical' : 'warning';
    
    const { data, error } = await this.supabase
      .from('kpi_insights')
      .insert({
        event_id: eventId,
        metric_id: kpi.metric_id,
        insight_type: 'anomaly',
        severity,
        insight_title: `${kpi.metric_name} Anomaly Detected`,
        insight_description: `Current value is ${kpi.variance_from_target_pct.toFixed(1)}% ${kpi.variance_from_target_pct > 0 ? 'above' : 'below'} target`,
        confidence_score: 0.85,
        actionable_recommendations: this.getAnomalyRecommendations(kpi),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create anomaly insight:', error);
      return null;
    }
    
    return data;
  }

  private async createRecommendationInsight(
    eventId: string,
    title: string,
    description: string,
    recommendations: string[]
  ): Promise<KPIInsight> {
    const { data, error } = await this.supabase
      .from('kpi_insights')
      .insert({
        event_id: eventId,
        insight_type: 'recommendation',
        severity: 'info',
        insight_title: title,
        insight_description: description,
        confidence_score: 0.75,
        actionable_recommendations: recommendations,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  private getAnomalyRecommendations(kpi: any): string[] {
    const recommendations: string[] = [];
    
    if (kpi.variance_from_target_pct > 0) {
      recommendations.push('Investigate factors contributing to above-target performance');
      recommendations.push('Document successful strategies for future events');
    } else {
      recommendations.push('Review and adjust strategy to meet targets');
      recommendations.push('Analyze competitor performance for insights');
    }
    
    return recommendations;
  }

  private linearRegression(values: number[]): number[] {
    if (values.length < 2) return [];
    
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Predict next 7 points
    return Array.from({ length: 7 }, (_, i) => slope * (n + i) + intercept);
  }
}

export const insightsEngineService = new InsightsEngineService();
