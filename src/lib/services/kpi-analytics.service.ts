/**
 * GVTEWAY KPI Analytics Service
 * Real-time analytics engine with Supabase integration
 */

import { createClient } from '@/lib/supabase/client';
import type {
  KPIMetric,
  KPIDataPoint,
  MetricCard,
  KPIInsight,
  DashboardDataRequest,
  DashboardDataResponse,
  CalculateKPIRequest,
  CalculateKPIResponse,
  GenerateReportRequest,
  GenerateReportResponse,
  EventKPILatest,
  ExecutiveDashboard,
  FinancialPerformance,
  TicketAttendanceSummary,
  OperationalEfficiency,
  MarketingPerformance,
  CustomerExperience,
  TrendDirection,
  ReportTemplate,
  GeneratedReport,
  KPIAlert,
  UserDashboard,
} from '@/types/kpi';

export class KPIAnalyticsService {
  private supabase = createClient();

  // =====================================================
  // CORE KPI METRICS
  // =====================================================

  /**
   * Get all active KPI metrics
   */
  async getMetrics(category?: string): Promise<KPIMetric[]> {
    let query = this.supabase
      .from('kpi_metrics')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (category) {
      query = query.eq('metric_category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get core 20 KPI metrics
   */
  async getCoreMetrics(): Promise<KPIMetric[]> {
    const { data, error } = await this.supabase
      .from('kpi_metrics')
      .select('*')
      .eq('is_core_metric', true)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get metric by code
   */
  async getMetricByCode(metricCode: string): Promise<KPIMetric | null> {
    const { data, error } = await this.supabase
      .from('kpi_metrics')
      .select('*')
      .eq('metric_code', metricCode)
      .single();

    if (error) throw error;
    return data;
  }

  // =====================================================
  // KPI DATA POINTS
  // =====================================================

  /**
   * Get latest KPI values for an event
   */
  async getEventKPILatest(eventId: string): Promise<EventKPILatest[]> {
    const { data, error } = await this.supabase
      .from('mv_event_kpi_latest')
      .select('*')
      .eq('event_id', eventId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get KPI data points with time series
   */
  async getKPIDataPoints(
    metricId: string,
    eventId?: string,
    dateRange?: [string, string]
  ): Promise<KPIDataPoint[]> {
    let query = this.supabase
      .from('kpi_data_points')
      .select('*')
      .eq('metric_id', metricId)
      .order('measured_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (dateRange) {
      query = query
        .gte('measured_at', dateRange[0])
        .lte('measured_at', dateRange[1]);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Calculate KPIs for an event
   */
  async calculateKPIs(request: CalculateKPIRequest): Promise<CalculateKPIResponse> {
    const { event_id, metric_codes, force_recalculate } = request;

    try {
      // Call stored procedure to calculate all core KPIs
      const { data, error } = await this.supabase.rpc('calculate_all_core_kpis', {
        p_event_id: event_id,
      });

      if (error) throw error;

      // Insert calculated values into kpi_data_points
      const results = data || [];
      const insertPromises = results.map((result: any) =>
        this.supabase.rpc('upsert_kpi_data_point', {
          p_metric_code: result.metric_code,
          p_event_id: event_id,
          p_value: result.metric_value,
          p_measured_at: result.calculated_at,
          p_data_source: 'calculated',
        })
      );

      await Promise.all(insertPromises);

      return {
        success: true,
        data: results.map((r: any) => ({
          metric_code: r.metric_code,
          value: r.metric_value,
          calculated_at: r.calculated_at,
        })),
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Insert manual KPI data point
   */
  async insertDataPoint(
    metricCode: string,
    eventId: string,
    value: number,
    metadata?: Record<string, any>
  ): Promise<string> {
    const { data, error } = await this.supabase.rpc('upsert_kpi_data_point', {
      p_metric_code: metricCode,
      p_event_id: eventId,
      p_value: value,
      p_data_source: 'manual',
      p_calculation_inputs: metadata || {},
    });

    if (error) throw error;
    return data;
  }

  // =====================================================
  // DASHBOARD DATA
  // =====================================================

  /**
   * Get dashboard data with metric cards
   */
  async getDashboardData(request: DashboardDataRequest): Promise<DashboardDataResponse> {
    const { event_id, metric_codes, date_range, include_trends, include_targets } = request;

    // Get latest KPI values
    const latestKPIs = event_id
      ? await this.getEventKPILatest(event_id)
      : [];

    // Get metrics metadata
    const metrics = await this.getMetrics();
    const metricsMap = new Map(metrics.map((m) => [m.id, m]));

    // Build metric cards
    const metricCards: MetricCard[] = latestKPIs.map((kpi) => {
      const metric = metricsMap.get(kpi.metric_id);
      if (!metric) {
        throw new Error(`Metric not found: ${kpi.metric_id}`);
      }

      return {
        metric,
        current_value: kpi.current_value,
        trend: this.determineTrend(kpi.current_value, kpi.target_value),
        percentage_change: kpi.variance_from_target_pct,
        comparison_period: 'vs target',
        target_value: kpi.target_value,
        visualization: metric.visualization_type,
      };
    });

    // Get insights
    const insights = event_id ? await this.getInsights(event_id) : [];

    // Build summary
    const summary = this.buildSummary(latestKPIs);

    return {
      metrics: metricCards,
      insights,
      summary,
      last_updated: new Date().toISOString(),
    };
  }

  /**
   * Get executive dashboard summary
   */
  async getExecutiveDashboard(eventId?: string): Promise<ExecutiveDashboard[]> {
    let query = this.supabase
      .from('mv_executive_dashboard')
      .select('*')
      .order('event_date', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get financial performance summary
   */
  async getFinancialPerformance(eventId?: string): Promise<FinancialPerformance[]> {
    let query = this.supabase
      .from('mv_financial_performance')
      .select('*')
      .order('event_date', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get ticket & attendance summary
   */
  async getTicketAttendanceSummary(eventId?: string): Promise<TicketAttendanceSummary[]> {
    let query = this.supabase
      .from('mv_ticket_attendance_summary')
      .select('*')
      .order('event_date', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get operational efficiency summary
   */
  async getOperationalEfficiency(eventId?: string): Promise<OperationalEfficiency[]> {
    let query = this.supabase
      .from('mv_operational_efficiency')
      .select('*')
      .order('event_date', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get marketing performance summary
   */
  async getMarketingPerformance(eventId?: string): Promise<MarketingPerformance[]> {
    let query = this.supabase
      .from('mv_marketing_performance')
      .select('*')
      .order('event_date', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get customer experience summary
   */
  async getCustomerExperience(eventId?: string): Promise<CustomerExperience[]> {
    let query = this.supabase
      .from('mv_customer_experience')
      .select('*')
      .order('event_date', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // =====================================================
  // INSIGHTS
  // =====================================================

  /**
   * Get AI-generated insights
   */
  async getInsights(eventId?: string, acknowledged?: boolean): Promise<KPIInsight[]> {
    let query = this.supabase
      .from('kpi_insights')
      .select('*')
      .order('created_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (acknowledged !== undefined) {
      query = query.eq('is_acknowledged', acknowledged);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Acknowledge insight
   */
  async acknowledgeInsight(insightId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('kpi_insights')
      .update({
        is_acknowledged: true,
        acknowledged_by: userId,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', insightId);

    if (error) throw error;
  }

  // =====================================================
  // REPORTS
  // =====================================================

  /**
   * Get report templates
   */
  async getReportTemplates(type?: string): Promise<ReportTemplate[]> {
    let query = this.supabase
      .from('report_templates')
      .select('*')
      .order('template_name', { ascending: true });

    if (type) {
      query = query.eq('template_type', type);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Generate report
   */
  async generateReport(request: GenerateReportRequest): Promise<GenerateReportResponse> {
    const {
      template_id,
      event_id,
      metric_codes,
      filters,
      date_range,
      export_format = 'json',
    } = request;

    try {
      // Get template if specified
      let template: ReportTemplate | null = null;
      if (template_id) {
        const { data } = await this.supabase
          .from('report_templates')
          .select('*')
          .eq('id', template_id)
          .single();
        template = data;
      }

      // Gather report data
      const reportData = await this.gatherReportData(
        event_id,
        metric_codes || template?.metrics_included || [],
        date_range
      );

      // Create generated report record
      const { data: report, error } = await this.supabase
        .from('generated_reports')
        .insert({
          template_id,
          report_name: template?.template_name || 'Custom Report',
          event_id,
          report_data: reportData,
          filters_applied: filters || {},
          date_range_start: date_range?.[0],
          date_range_end: date_range?.[1],
          status: 'completed',
          file_format: export_format,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        report_id: report.id,
        status: 'completed',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get generated reports
   */
  async getGeneratedReports(eventId?: string): Promise<GeneratedReport[]> {
    let query = this.supabase
      .from('generated_reports')
      .select('*')
      .order('generated_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  // =====================================================
  // ALERTS
  // =====================================================

  /**
   * Get KPI alerts
   */
  async getAlerts(metricId?: string, activeOnly = true): Promise<KPIAlert[]> {
    let query = this.supabase
      .from('kpi_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (metricId) {
      query = query.eq('metric_id', metricId);
    }

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Create KPI alert
   */
  async createAlert(alert: Omit<KPIAlert, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const { data, error } = await this.supabase
      .from('kpi_alerts')
      .insert(alert)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  // =====================================================
  // USER DASHBOARDS
  // =====================================================

  /**
   * Get user dashboards
   */
  async getUserDashboards(userId: string): Promise<UserDashboard[]> {
    const { data, error } = await this.supabase
      .from('user_dashboards')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Save user dashboard
   */
  async saveDashboard(dashboard: Omit<UserDashboard, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const { data, error } = await this.supabase
      .from('user_dashboards')
      .upsert(dashboard)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  /**
   * Subscribe to KPI data point updates
   */
  subscribeToKPIUpdates(
    eventId: string,
    callback: (payload: any) => void
  ) {
    return this.supabase
      .channel(`kpi-updates-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'kpi_data_points',
          filter: `event_id=eq.${eventId}`,
        },
        callback
      )
      .subscribe();
  }

  /**
   * Subscribe to insight updates
   */
  subscribeToInsights(
    eventId: string,
    callback: (payload: any) => void
  ) {
    return this.supabase
      .channel(`insights-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'kpi_insights',
          filter: `event_id=eq.${eventId}`,
        },
        callback
      )
      .subscribe();
  }

  /**
   * Refresh materialized views
   */
  async refreshViews(category?: string): Promise<void> {
    if (category) {
      await this.supabase.rpc('refresh_kpi_views_by_category', {
        category,
      });
    } else {
      await this.supabase.rpc('refresh_all_kpi_views');
    }
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private determineTrend(currentValue: number, targetValue: number | null): TrendDirection {
    if (!targetValue) return 'unknown';

    const variance = ((currentValue - targetValue) / targetValue) * 100;

    if (Math.abs(variance) < 1) return 'stable';
    return variance > 0 ? 'up' : 'down';
  }

  private buildSummary(kpis: EventKPILatest[]) {
    const revenueKPI = kpis.find((k) => k.metric_code === 'total_event_revenue');
    const profitMarginKPI = kpis.find((k) => k.metric_code === 'profit_margin_percentage');

    return {
      total_revenue: revenueKPI?.current_value,
      profit_margin: profitMarginKPI?.current_value,
      key_highlights: [],
      critical_alerts: [],
    };
  }

  private async gatherReportData(
    eventId?: string,
    metricIds: string[] = [],
    dateRange?: [string, string]
  ) {
    // Gather all relevant data for the report
    const metrics = await this.getMetrics();
    const filteredMetrics = metrics.filter((m) => metricIds.includes(m.id));

    const dataPoints = await Promise.all(
      filteredMetrics.map((m) => this.getKPIDataPoints(m.id, eventId, dateRange))
    );

    return {
      metrics: filteredMetrics,
      data_points: dataPoints.flat(),
      generated_at: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const kpiAnalyticsService = new KPIAnalyticsService();
