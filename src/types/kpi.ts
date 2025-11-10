/**
 * GVTEWAY KPI Analytics - TypeScript Type Definitions
 * Complete type system for KPI reporting and analytics
 */

// =====================================================
// ENUMS
// =====================================================

export type KPICategory =
  | 'financial_revenue'
  | 'financial_cost'
  | 'financial_profitability'
  | 'ticket_sales'
  | 'ticket_attendance'
  | 'ticket_pricing'
  | 'operational_project'
  | 'operational_team'
  | 'operational_vendor'
  | 'marketing_digital'
  | 'marketing_audience'
  | 'marketing_brand'
  | 'experience_quality'
  | 'experience_service'
  | 'experience_loyalty'
  | 'safety_security'
  | 'safety_risk'
  | 'sustainability_environmental'
  | 'sustainability_social'
  | 'technology_performance';

export type ReportType =
  | 'executive_summary'
  | 'financial_analysis'
  | 'operational_review'
  | 'marketing_performance'
  | 'event_comparison'
  | 'custom';

export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed' | 'archived';

export type MetricVisualization =
  | 'number'
  | 'percentage'
  | 'currency'
  | 'sparkline'
  | 'line_chart'
  | 'bar_chart'
  | 'pie_chart'
  | 'gauge'
  | 'heatmap'
  | 'funnel'
  | 'geographic';

export type TrendDirection = 'up' | 'down' | 'stable' | 'unknown';

export type ReportingFrequency =
  | 'real_time'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'event_based';

export type InsightType = 'anomaly' | 'trend' | 'prediction' | 'recommendation';

export type InsightSeverity = 'critical' | 'warning' | 'info' | 'positive';

export type BenchmarkType = 'industry' | 'historical' | 'peer' | 'custom';

// =====================================================
// CORE INTERFACES
// =====================================================

export interface KPIMetric {
  id: string;
  metric_name: string;
  metric_code: string;
  metric_category: KPICategory;
  description: string | null;
  calculation_method: CalculationMethod;
  target_value: number | null;
  unit_of_measurement: string | null;
  visualization_type: MetricVisualization;
  reporting_frequency: ReportingFrequency;
  is_active: boolean;
  is_core_metric: boolean;
  display_order: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CalculationMethod {
  function?: string;
  formula?: string;
  sources: string[];
  parameters?: Record<string, any>;
}

export interface KPIDataPoint {
  id: string;
  metric_id: string;
  event_id: string | null;
  venue_id: string | null;
  value: number;
  measured_at: string;
  period_start: string | null;
  period_end: string | null;
  data_source: string | null;
  calculation_inputs: Record<string, any> | null;
  metadata: Record<string, any>;
  created_at: string;
  created_by: string | null;
}

export interface KPITarget {
  id: string;
  metric_id: string;
  event_id: string | null;
  target_value: number;
  target_period_start: string;
  target_period_end: string;
  target_type: string;
  comparison_operator: string;
  is_stretch_goal: boolean;
  created_at: string;
  created_by: string | null;
}

// =====================================================
// REPORTING INTERFACES
// =====================================================

export interface ReportTemplate {
  id: string;
  template_name: string;
  template_code: string;
  template_type: ReportType;
  description: string | null;
  metrics_included: string[];
  layout_config: LayoutConfig;
  filter_config: FilterConfig;
  visualization_config: Record<string, any>;
  is_default: boolean;
  is_public: boolean;
  access_roles: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LayoutConfig {
  layout: 'grid' | 'list' | 'sections' | 'custom';
  columns?: number;
  sections?: string[];
  charts?: string[];
  customLayout?: Record<string, any>;
}

export interface FilterConfig {
  dateRange?: [string, string];
  eventType?: string[];
  venue?: string[];
  customFilters?: Record<string, any>;
}

export interface GeneratedReport {
  id: string;
  template_id: string | null;
  report_name: string;
  event_id: string | null;
  report_data: ReportData;
  filters_applied: FilterConfig;
  date_range_start: string | null;
  date_range_end: string | null;
  status: ReportStatus;
  file_url: string | null;
  file_format: string | null;
  generated_at: string;
  generated_by: string | null;
  expires_at: string | null;
  metadata: Record<string, any>;
}

export interface ReportData {
  metrics: MetricSnapshot[];
  summary: ReportSummary;
  insights?: KPIInsight[];
  comparisons?: ComparisonData[];
  charts?: ChartData[];
}

export interface MetricSnapshot {
  metric_id: string;
  metric_name: string;
  metric_code: string;
  current_value: number;
  previous_value?: number;
  target_value?: number;
  trend: TrendDirection;
  percentage_change?: number;
  variance_from_target?: number;
  unit: string;
  visualization: MetricVisualization;
}

export interface ReportSummary {
  total_revenue?: number;
  total_attendees?: number;
  profit_margin?: number;
  key_highlights: string[];
  critical_alerts: string[];
}

export interface ComparisonData {
  metric_code: string;
  current_period: number;
  previous_period: number;
  industry_benchmark?: number;
  variance_pct: number;
}

export interface ChartData {
  chart_type: MetricVisualization;
  title: string;
  data: any[];
  config?: Record<string, any>;
}

export interface ScheduledReport {
  id: string;
  template_id: string;
  schedule_name: string;
  cron_expression: string;
  recipients: string[];
  filter_config: FilterConfig;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INSIGHTS & ANALYTICS INTERFACES
// =====================================================

export interface KPIInsight {
  id: string;
  metric_id: string | null;
  event_id: string | null;
  insight_type: InsightType;
  insight_title: string;
  insight_description: string;
  severity: InsightSeverity;
  confidence_score: number | null;
  supporting_data: Record<string, any> | null;
  actionable_recommendations: string[] | null;
  is_acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

export interface KPIBenchmark {
  id: string;
  metric_id: string;
  benchmark_type: BenchmarkType;
  benchmark_value: number;
  benchmark_source: string | null;
  event_type: string | null;
  venue_type: string | null;
  geographic_region: string | null;
  valid_from: string;
  valid_until: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

// =====================================================
// DASHBOARD INTERFACES
// =====================================================

export interface UserDashboard {
  id: string;
  user_id: string;
  dashboard_name: string;
  layout_config: DashboardLayout;
  metrics_displayed: string[];
  filters_config: FilterConfig;
  refresh_interval: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardLayout {
  layout: 'grid' | 'list' | 'custom';
  columns?: number;
  widgets: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  type: 'metric_card' | 'chart' | 'table' | 'insight' | 'custom';
  position: { x: number; y: number; w: number; h: number };
  config: WidgetConfig;
}

export interface WidgetConfig {
  metric_id?: string;
  chart_type?: MetricVisualization;
  title?: string;
  show_trend?: boolean;
  show_target?: boolean;
  custom_config?: Record<string, any>;
}

export interface MetricCard {
  metric: KPIMetric;
  current_value: number;
  trend: TrendDirection;
  percentage_change: number | null;
  comparison_period: string;
  target_value: number | null;
  visualization: MetricVisualization;
  sparkline_data?: number[];
}

// =====================================================
// ALERT INTERFACES
// =====================================================

export interface KPIAlert {
  id: string;
  metric_id: string;
  alert_name: string;
  condition_config: AlertCondition;
  notification_channels: ('in_app' | 'email' | 'sms' | 'slack')[];
  recipients: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  trigger_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlertCondition {
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
  threshold_value: number;
  threshold_value_max?: number;
  comparison_type: 'absolute' | 'percentage_change' | 'vs_target';
  time_window?: string;
}

export interface KPIAlertHistory {
  id: string;
  alert_id: string;
  metric_id: string;
  triggered_value: number;
  threshold_value: number;
  triggered_at: string;
  notification_sent: boolean;
  metadata: Record<string, any>;
}

// =====================================================
// MATERIALIZED VIEW INTERFACES
// =====================================================

export interface EventKPILatest {
  event_id: string;
  metric_id: string;
  metric_name: string;
  metric_code: string;
  metric_category: KPICategory;
  unit_of_measurement: string | null;
  current_value: number;
  last_measured_at: string;
  target_value: number | null;
  variance_from_target_pct: number | null;
  metadata: Record<string, any>;
}

export interface KPIDailyTrend {
  metric_id: string;
  metric_name: string;
  metric_category: KPICategory;
  event_id: string | null;
  measurement_date: string;
  avg_value: number;
  min_value: number;
  max_value: number;
  measurement_count: number;
  std_deviation: number | null;
}

export interface FinancialPerformance {
  event_id: string;
  event_name: string;
  event_date: string;
  total_revenue: number | null;
  vip_revenue_pct: number | null;
  merch_per_attendee: number | null;
  fb_per_attendee: number | null;
  cost_per_attendee: number | null;
  labor_cost_pct: number | null;
  marketing_cost_pct: number | null;
  profit_margin: number | null;
  roi: number | null;
  ebitda_margin: number | null;
  last_updated: string;
}

export interface TicketAttendanceSummary {
  event_id: string;
  event_name: string;
  event_date: string;
  capacity: number | null;
  conversion_rate: number | null;
  sell_through_rate: number | null;
  avg_ticket_price: number | null;
  early_bird_rate: number | null;
  attendance_rate: number | null;
  no_show_rate: number | null;
  capacity_utilization: number | null;
  tier_upgrade_rate: number | null;
  discount_redemption_rate: number | null;
  last_updated: string;
}

export interface OperationalEfficiency {
  event_id: string;
  event_name: string;
  event_date: string;
  schedule_adherence: number | null;
  task_completion: number | null;
  milestone_velocity: number | null;
  staff_ratio: number | null;
  staff_utilization: number | null;
  employee_satisfaction: number | null;
  vendor_response_time: number | null;
  vendor_reliability: number | null;
  contract_compliance: number | null;
  last_updated: string;
}

export interface MarketingPerformance {
  event_id: string;
  event_name: string;
  event_date: string;
  social_engagement: number | null;
  email_ctr: number | null;
  website_conversion: number | null;
  ad_roas: number | null;
  first_time_ratio: number | null;
  referral_rate: number | null;
  nps: number | null;
  brand_sentiment: number | null;
  marketing_cpa: number | null;
  last_updated: string;
}

export interface CustomerExperience {
  event_id: string;
  event_name: string;
  event_date: string;
  overall_satisfaction: number | null;
  likelihood_recommend: number | null;
  venue_rating: number | null;
  sound_rating: number | null;
  resolution_time: number | null;
  first_contact_resolution: number | null;
  complaint_rate: number | null;
  repeat_purchase_rate: number | null;
  churn_rate: number | null;
  last_updated: string;
}

export interface ExecutiveDashboard {
  event_id: string;
  event_name: string;
  event_date: string;
  event_status: string | null;
  // Financial Top 5
  total_revenue: number | null;
  profit_margin: number | null;
  roi: number | null;
  cost_per_attendee: number | null;
  revpah: number | null;
  // Tickets Top 5
  sell_through_rate: number | null;
  attendance_rate: number | null;
  avg_ticket_price: number | null;
  conversion_rate: number | null;
  early_bird_rate: number | null;
  // Operations Top 5
  schedule_adherence: number | null;
  task_completion: number | null;
  staff_ratio: number | null;
  vendor_response_time: number | null;
  setup_efficiency: number | null;
  // Marketing Top 5
  nps: number | null;
  social_engagement: number | null;
  email_ctr: number | null;
  marketing_cpa: number | null;
  brand_mentions: number | null;
  last_updated: string;
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface CalculateKPIRequest {
  event_id: string;
  metric_codes?: string[];
  force_recalculate?: boolean;
}

export interface CalculateKPIResponse {
  success: boolean;
  data: {
    metric_code: string;
    value: number;
    calculated_at: string;
  }[];
  errors?: string[];
}

export interface GenerateReportRequest {
  template_id?: string;
  event_id?: string;
  metric_codes?: string[];
  filters?: FilterConfig;
  date_range?: [string, string];
  export_format?: 'pdf' | 'excel' | 'csv' | 'json';
}

export interface GenerateReportResponse {
  success: boolean;
  report_id: string;
  download_url?: string;
  status: ReportStatus;
}

export interface DashboardDataRequest {
  event_id?: string;
  metric_codes?: string[];
  date_range?: [string, string];
  include_trends?: boolean;
  include_targets?: boolean;
}

export interface DashboardDataResponse {
  metrics: MetricCard[];
  insights: KPIInsight[];
  summary: ReportSummary;
  last_updated: string;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export interface DateRange {
  start: string;
  end: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}

// =====================================================
// CHART DATA TYPES
// =====================================================

export interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
}

export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
  }[];
}

export interface PieChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor?: string[];
  }[];
}

export interface GaugeChartData {
  value: number;
  min: number;
  max: number;
  target?: number;
  thresholds?: {
    value: number;
    color: string;
  }[];
}

export interface SparklineData {
  data: number[];
  trend: TrendDirection;
  change_pct: number;
}
