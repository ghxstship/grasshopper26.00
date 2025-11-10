-- =====================================================
-- GVTEWAY KPI Analytics & Reporting System
-- Migration: Core Schema and Tables
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA extensions;

-- Make uuid functions available
CREATE OR REPLACE FUNCTION uuid_generate_v4()
RETURNS uuid AS $$
  SELECT extensions.uuid_generate_v4();
$$ LANGUAGE sql VOLATILE;

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE kpi_category AS ENUM (
  'financial_revenue',
  'financial_cost',
  'financial_profitability',
  'ticket_sales',
  'ticket_attendance',
  'ticket_pricing',
  'operational_project',
  'operational_team',
  'operational_vendor',
  'marketing_digital',
  'marketing_audience',
  'marketing_brand',
  'experience_quality',
  'experience_service',
  'experience_loyalty',
  'safety_security',
  'safety_risk',
  'sustainability_environmental',
  'sustainability_social',
  'technology_performance'
);

CREATE TYPE report_type AS ENUM (
  'executive_summary',
  'financial_analysis',
  'operational_review',
  'marketing_performance',
  'event_comparison',
  'custom'
);

CREATE TYPE report_status AS ENUM (
  'pending',
  'generating',
  'completed',
  'failed',
  'archived'
);

CREATE TYPE metric_visualization AS ENUM (
  'number',
  'percentage',
  'currency',
  'sparkline',
  'line_chart',
  'bar_chart',
  'pie_chart',
  'gauge',
  'heatmap',
  'funnel',
  'geographic'
);

CREATE TYPE trend_direction AS ENUM (
  'up',
  'down',
  'stable',
  'unknown'
);

CREATE TYPE reporting_frequency AS ENUM (
  'real_time',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'event_based'
);

-- =====================================================
-- CORE KPI TABLES
-- =====================================================

-- KPI Metrics Definition
CREATE TABLE kpi_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL UNIQUE,
  metric_code TEXT NOT NULL UNIQUE, -- e.g., 'total_event_revenue'
  metric_category kpi_category NOT NULL,
  description TEXT,
  calculation_method JSONB NOT NULL, -- Stores formula and data sources
  target_value DECIMAL(15,2),
  unit_of_measurement TEXT, -- e.g., 'USD', 'percentage', 'count'
  visualization_type metric_visualization DEFAULT 'number',
  reporting_frequency reporting_frequency DEFAULT 'daily',
  is_active BOOLEAN DEFAULT true,
  is_core_metric BOOLEAN DEFAULT false, -- Top 20 core metrics
  display_order INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPI Data Points (Time Series)
CREATE TABLE kpi_data_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID NOT NULL REFERENCES kpi_metrics(id) ON DELETE CASCADE,
  event_id UUID, -- Will add FK constraint after events table exists
  venue_id UUID, -- Will add FK constraint after venues table exists
  value DECIMAL(15,4) NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  data_source TEXT, -- e.g., 'calculated', 'manual', 'imported'
  calculation_inputs JSONB, -- Store input values for audit trail
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID -- Will add FK constraint after users table exists
);

-- KPI Targets (Goals and Benchmarks)
CREATE TABLE kpi_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID NOT NULL REFERENCES kpi_metrics(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  target_value DECIMAL(15,2) NOT NULL,
  target_period_start TIMESTAMPTZ NOT NULL,
  target_period_end TIMESTAMPTZ NOT NULL,
  target_type TEXT DEFAULT 'goal', -- 'goal', 'threshold', 'benchmark'
  comparison_operator TEXT DEFAULT 'gte', -- 'gte', 'lte', 'eq', 'between'
  is_stretch_goal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =====================================================
-- REPORTING TABLES
-- =====================================================

-- Report Templates
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name TEXT NOT NULL,
  template_code TEXT NOT NULL UNIQUE,
  template_type report_type NOT NULL,
  description TEXT,
  metrics_included UUID[] NOT NULL, -- Array of kpi_metrics.id
  layout_config JSONB NOT NULL, -- Dashboard layout configuration
  filter_config JSONB DEFAULT '{}', -- Default filters
  visualization_config JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  access_roles TEXT[] DEFAULT ARRAY['admin'],
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Reports
CREATE TABLE generated_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  report_name TEXT NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  report_data JSONB NOT NULL, -- Complete report data snapshot
  filters_applied JSONB DEFAULT '{}',
  date_range_start TIMESTAMPTZ,
  date_range_end TIMESTAMPTZ,
  status report_status DEFAULT 'pending',
  file_url TEXT, -- For exported PDF/Excel files
  file_format TEXT, -- 'pdf', 'excel', 'csv', 'json'
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Scheduled Reports
CREATE TABLE scheduled_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
  schedule_name TEXT NOT NULL,
  cron_expression TEXT NOT NULL, -- e.g., '0 9 * * 1' for every Monday at 9am
  recipients TEXT[] NOT NULL, -- Email addresses
  filter_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INSIGHTS & ANALYTICS TABLES
-- =====================================================

-- AI-Generated Insights
CREATE TABLE kpi_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID REFERENCES kpi_metrics(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'anomaly', 'trend', 'prediction', 'recommendation'
  insight_title TEXT NOT NULL,
  insight_description TEXT NOT NULL,
  severity TEXT DEFAULT 'info', -- 'critical', 'warning', 'info', 'positive'
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  supporting_data JSONB,
  actionable_recommendations TEXT[],
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Benchmark Comparisons
CREATE TABLE kpi_benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID NOT NULL REFERENCES kpi_metrics(id) ON DELETE CASCADE,
  benchmark_type TEXT NOT NULL, -- 'industry', 'historical', 'peer', 'custom'
  benchmark_value DECIMAL(15,2) NOT NULL,
  benchmark_source TEXT,
  event_type TEXT,
  venue_type TEXT,
  geographic_region TEXT,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DASHBOARD & USER PREFERENCES
-- =====================================================

-- User Dashboard Configurations
CREATE TABLE user_dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_name TEXT NOT NULL,
  layout_config JSONB NOT NULL,
  metrics_displayed UUID[] NOT NULL,
  filters_config JSONB DEFAULT '{}',
  refresh_interval INTEGER DEFAULT 60, -- seconds
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, dashboard_name)
);

-- KPI Alerts & Notifications
CREATE TABLE kpi_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID NOT NULL REFERENCES kpi_metrics(id) ON DELETE CASCADE,
  alert_name TEXT NOT NULL,
  condition_config JSONB NOT NULL, -- Threshold conditions
  notification_channels TEXT[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'sms', 'slack'
  recipients UUID[] NOT NULL, -- Array of user IDs
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert History
CREATE TABLE kpi_alert_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID NOT NULL REFERENCES kpi_alerts(id) ON DELETE CASCADE,
  metric_id UUID NOT NULL REFERENCES kpi_metrics(id) ON DELETE CASCADE,
  triggered_value DECIMAL(15,2) NOT NULL,
  threshold_value DECIMAL(15,2) NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  notification_sent BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- KPI Metrics Indexes
CREATE INDEX idx_kpi_metrics_category ON kpi_metrics(metric_category);
CREATE INDEX idx_kpi_metrics_active ON kpi_metrics(is_active) WHERE is_active = true;
CREATE INDEX idx_kpi_metrics_core ON kpi_metrics(is_core_metric) WHERE is_core_metric = true;

-- KPI Data Points Indexes (Critical for query performance)
CREATE INDEX idx_kpi_data_points_metric ON kpi_data_points(metric_id);
CREATE INDEX idx_kpi_data_points_event ON kpi_data_points(event_id);
CREATE INDEX idx_kpi_data_points_measured_at ON kpi_data_points(measured_at DESC);
CREATE INDEX idx_kpi_data_points_metric_measured ON kpi_data_points(metric_id, measured_at DESC);
CREATE INDEX idx_kpi_data_points_event_measured ON kpi_data_points(event_id, measured_at DESC);
CREATE INDEX idx_kpi_data_points_period ON kpi_data_points(period_start, period_end);

-- Report Indexes
CREATE INDEX idx_report_templates_type ON report_templates(template_type);
CREATE INDEX idx_generated_reports_event ON generated_reports(event_id);
CREATE INDEX idx_generated_reports_status ON generated_reports(status);
CREATE INDEX idx_generated_reports_generated_at ON generated_reports(generated_at DESC);

-- Insights Indexes
CREATE INDEX idx_kpi_insights_metric ON kpi_insights(metric_id);
CREATE INDEX idx_kpi_insights_event ON kpi_insights(event_id);
CREATE INDEX idx_kpi_insights_type ON kpi_insights(insight_type);
CREATE INDEX idx_kpi_insights_acknowledged ON kpi_insights(is_acknowledged) WHERE is_acknowledged = false;

-- Dashboard Indexes
CREATE INDEX idx_user_dashboards_user ON user_dashboards(user_id);
CREATE INDEX idx_kpi_alerts_metric ON kpi_alerts(metric_id);
CREATE INDEX idx_kpi_alerts_active ON kpi_alerts(is_active) WHERE is_active = true;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kpi_metrics_updated_at BEFORE UPDATE ON kpi_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_dashboards_updated_at BEFORE UPDATE ON user_dashboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_reports_updated_at BEFORE UPDATE ON scheduled_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_alert_history ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admins have full access to kpi_metrics" ON kpi_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.team_role IN ('admin', 'super_admin', 'legend')
    )
  );

-- Users can view active metrics
CREATE POLICY "Users can view active kpi_metrics" ON kpi_metrics
  FOR SELECT USING (is_active = true);

-- Users can view data points for their accessible events
CREATE POLICY "Users can view kpi_data_points" ON kpi_data_points
  FOR SELECT USING (
    event_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.team_role IN ('admin', 'super_admin', 'legend')
    ) OR
    EXISTS (
      SELECT 1 FROM event_team_assignments eta
      WHERE eta.event_id = kpi_data_points.event_id
      AND eta.user_id = auth.uid()
      AND eta.status = 'active'
    )
  );

-- Users can view their own dashboards
CREATE POLICY "Users can manage their own dashboards" ON user_dashboards
  FOR ALL USING (user_id = auth.uid());

-- Users can view reports they generated or have access to
CREATE POLICY "Users can view accessible reports" ON generated_reports
  FOR SELECT USING (
    generated_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.team_role IN ('admin', 'super_admin', 'legend', 'lead')
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE kpi_metrics IS 'Defines all available KPI metrics with calculation methods';
COMMENT ON TABLE kpi_data_points IS 'Time-series data for all KPI measurements';
COMMENT ON TABLE kpi_targets IS 'Goal and benchmark targets for KPIs';
COMMENT ON TABLE report_templates IS 'Reusable report configurations';
COMMENT ON TABLE generated_reports IS 'Historical generated reports with data snapshots';
COMMENT ON TABLE kpi_insights IS 'AI-generated insights and recommendations';
COMMENT ON TABLE user_dashboards IS 'User-specific dashboard configurations';
COMMENT ON TABLE kpi_alerts IS 'Alert configurations for KPI thresholds';
