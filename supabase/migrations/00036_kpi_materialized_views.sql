-- =====================================================
-- GVTEWAY KPI Analytics - Materialized Views
-- High-performance aggregated views for dashboards
-- =====================================================

-- =====================================================
-- EVENT-LEVEL KPI AGGREGATIONS
-- =====================================================

-- Latest KPI values per event
CREATE MATERIALIZED VIEW mv_event_kpi_latest AS
SELECT 
  kdp.event_id,
  kdp.metric_id,
  km.metric_name,
  km.metric_code,
  km.metric_category,
  km.unit_of_measurement,
  kdp.value AS current_value,
  kdp.measured_at AS last_measured_at,
  kt.target_value,
  CASE 
    WHEN kt.target_value IS NOT NULL AND kt.target_value > 0 THEN
      ((kdp.value - kt.target_value) / kt.target_value * 100)
    ELSE NULL
  END AS variance_from_target_pct,
  kdp.metadata
FROM kpi_data_points kdp
INNER JOIN kpi_metrics km ON kdp.metric_id = km.id
LEFT JOIN LATERAL (
  SELECT target_value
  FROM kpi_targets
  WHERE metric_id = kdp.metric_id
    AND event_id = kdp.event_id
    AND NOW() BETWEEN target_period_start AND target_period_end
  ORDER BY created_at DESC
  LIMIT 1
) kt ON true
WHERE kdp.id IN (
  SELECT DISTINCT ON (metric_id, event_id) id
  FROM kpi_data_points
  WHERE event_id IS NOT NULL
  ORDER BY metric_id, event_id, measured_at DESC
)
AND km.is_active = true;

CREATE UNIQUE INDEX idx_mv_event_kpi_latest_unique ON mv_event_kpi_latest(event_id, metric_id);
CREATE INDEX idx_mv_event_kpi_latest_event ON mv_event_kpi_latest(event_id);
CREATE INDEX idx_mv_event_kpi_latest_category ON mv_event_kpi_latest(metric_category);

-- =====================================================
-- TIME-SERIES TREND ANALYSIS
-- =====================================================

-- Daily KPI aggregations for trend analysis
CREATE MATERIALIZED VIEW mv_kpi_daily_trends AS
SELECT 
  kdp.metric_id,
  km.metric_name,
  km.metric_category,
  kdp.event_id,
  DATE(kdp.measured_at) AS measurement_date,
  AVG(kdp.value) AS avg_value,
  MIN(kdp.value) AS min_value,
  MAX(kdp.value) AS max_value,
  COUNT(*) AS measurement_count,
  STDDEV(kdp.value) AS std_deviation
FROM kpi_data_points kdp
INNER JOIN kpi_metrics km ON kdp.metric_id = km.id
WHERE km.is_active = true
  AND kdp.measured_at >= NOW() - INTERVAL '90 days'
GROUP BY 
  kdp.metric_id,
  km.metric_name,
  km.metric_category,
  kdp.event_id,
  DATE(kdp.measured_at);

CREATE INDEX idx_mv_kpi_daily_trends_metric ON mv_kpi_daily_trends(metric_id, measurement_date DESC);
CREATE INDEX idx_mv_kpi_daily_trends_event ON mv_kpi_daily_trends(event_id, measurement_date DESC);
CREATE INDEX idx_mv_kpi_daily_trends_date ON mv_kpi_daily_trends(measurement_date DESC);

-- =====================================================
-- FINANCIAL PERFORMANCE SUMMARY
-- =====================================================

CREATE MATERIALIZED VIEW mv_financial_performance AS
SELECT 
  e.id AS event_id,
  e.name AS event_name,
  e.start_date AS event_date,
  
  -- Revenue Metrics
  MAX(CASE WHEN km.metric_code = 'total_event_revenue' THEN kdp.value END) AS total_revenue,
  MAX(CASE WHEN km.metric_code = 'vip_revenue_percentage' THEN kdp.value END) AS vip_revenue_pct,
  MAX(CASE WHEN km.metric_code = 'merchandise_revenue_per_attendee' THEN kdp.value END) AS merch_per_attendee,
  MAX(CASE WHEN km.metric_code = 'fb_revenue_per_attendee' THEN kdp.value END) AS fb_per_attendee,
  
  -- Cost Metrics
  MAX(CASE WHEN km.metric_code = 'cost_per_attendee' THEN kdp.value END) AS cost_per_attendee,
  MAX(CASE WHEN km.metric_code = 'labor_cost_percentage' THEN kdp.value END) AS labor_cost_pct,
  MAX(CASE WHEN km.metric_code = 'marketing_cost_percentage' THEN kdp.value END) AS marketing_cost_pct,
  
  -- Profitability
  MAX(CASE WHEN km.metric_code = 'profit_margin_percentage' THEN kdp.value END) AS profit_margin,
  MAX(CASE WHEN km.metric_code = 'roi' THEN kdp.value END) AS roi,
  MAX(CASE WHEN km.metric_code = 'ebitda_margin' THEN kdp.value END) AS ebitda_margin,
  
  MAX(kdp.measured_at) AS last_updated
FROM events e
LEFT JOIN kpi_data_points kdp ON e.id = kdp.event_id
LEFT JOIN kpi_metrics km ON kdp.metric_id = km.id
WHERE km.metric_category IN ('financial_revenue', 'financial_cost', 'financial_profitability')
  AND e.start_date >= NOW() - INTERVAL '1 year'
GROUP BY e.id, e.name, e.start_date;

CREATE UNIQUE INDEX idx_mv_financial_performance_event ON mv_financial_performance(event_id);
CREATE INDEX idx_mv_financial_performance_date ON mv_financial_performance(event_date DESC);

-- =====================================================
-- TICKET & ATTENDANCE SUMMARY
-- =====================================================

CREATE MATERIALIZED VIEW mv_ticket_attendance_summary AS
SELECT 
  e.id AS event_id,
  e.name AS event_name,
  e.start_date AS event_date,
  e.capacity,
  
  -- Sales Metrics
  MAX(CASE WHEN km.metric_code = 'ticket_sales_conversion_rate' THEN kdp.value END) AS conversion_rate,
  MAX(CASE WHEN km.metric_code = 'sell_through_rate' THEN kdp.value END) AS sell_through_rate,
  MAX(CASE WHEN km.metric_code = 'average_ticket_price' THEN kdp.value END) AS avg_ticket_price,
  MAX(CASE WHEN km.metric_code = 'early_bird_conversion_rate' THEN kdp.value END) AS early_bird_rate,
  
  -- Attendance
  MAX(CASE WHEN km.metric_code = 'attendance_rate' THEN kdp.value END) AS attendance_rate,
  MAX(CASE WHEN km.metric_code = 'no_show_rate' THEN kdp.value END) AS no_show_rate,
  MAX(CASE WHEN km.metric_code = 'capacity_utilization_rate' THEN kdp.value END) AS capacity_utilization,
  
  -- Pricing
  MAX(CASE WHEN km.metric_code = 'tier_upgrade_rate' THEN kdp.value END) AS tier_upgrade_rate,
  MAX(CASE WHEN km.metric_code = 'discount_redemption_rate' THEN kdp.value END) AS discount_redemption_rate,
  
  MAX(kdp.measured_at) AS last_updated
FROM events e
LEFT JOIN kpi_data_points kdp ON e.id = kdp.event_id
LEFT JOIN kpi_metrics km ON kdp.metric_id = km.id
WHERE km.metric_category IN ('ticket_sales', 'ticket_attendance', 'ticket_pricing')
  AND e.start_date >= NOW() - INTERVAL '1 year'
GROUP BY e.id, e.name, e.start_date, e.capacity;

CREATE UNIQUE INDEX idx_mv_ticket_attendance_event ON mv_ticket_attendance_summary(event_id);
CREATE INDEX idx_mv_ticket_attendance_date ON mv_ticket_attendance_summary(event_date DESC);

-- =====================================================
-- OPERATIONAL EFFICIENCY SUMMARY
-- =====================================================

CREATE MATERIALIZED VIEW mv_operational_efficiency AS
SELECT 
  e.id AS event_id,
  e.name AS event_name,
  e.start_date AS event_date,
  
  -- Project Management
  MAX(CASE WHEN km.metric_code = 'schedule_adherence_rate' THEN kdp.value END) AS schedule_adherence,
  MAX(CASE WHEN km.metric_code = 'task_completion_rate' THEN kdp.value END) AS task_completion,
  MAX(CASE WHEN km.metric_code = 'milestone_completion_velocity' THEN kdp.value END) AS milestone_velocity,
  
  -- Team Performance
  MAX(CASE WHEN km.metric_code = 'staff_to_attendee_ratio' THEN kdp.value END) AS staff_ratio,
  MAX(CASE WHEN km.metric_code = 'staff_utilization_rate' THEN kdp.value END) AS staff_utilization,
  MAX(CASE WHEN km.metric_code = 'employee_satisfaction_score' THEN kdp.value END) AS employee_satisfaction,
  
  -- Vendor Management
  MAX(CASE WHEN km.metric_code = 'vendor_response_time' THEN kdp.value END) AS vendor_response_time,
  MAX(CASE WHEN km.metric_code = 'vendor_reliability_score' THEN kdp.value END) AS vendor_reliability,
  MAX(CASE WHEN km.metric_code = 'contract_compliance_rate' THEN kdp.value END) AS contract_compliance,
  
  MAX(kdp.measured_at) AS last_updated
FROM events e
LEFT JOIN kpi_data_points kdp ON e.id = kdp.event_id
LEFT JOIN kpi_metrics km ON kdp.metric_id = km.id
WHERE km.metric_category IN ('operational_project', 'operational_team', 'operational_vendor')
  AND e.start_date >= NOW() - INTERVAL '1 year'
GROUP BY e.id, e.name, e.start_date;

CREATE UNIQUE INDEX idx_mv_operational_efficiency_event ON mv_operational_efficiency(event_id);
CREATE INDEX idx_mv_operational_efficiency_date ON mv_operational_efficiency(event_date DESC);

-- =====================================================
-- MARKETING PERFORMANCE SUMMARY
-- =====================================================

CREATE MATERIALIZED VIEW mv_marketing_performance AS
SELECT 
  e.id AS event_id,
  e.name AS event_name,
  e.start_date AS event_date,
  
  -- Digital Marketing
  MAX(CASE WHEN km.metric_code = 'social_media_engagement_rate' THEN kdp.value END) AS social_engagement,
  MAX(CASE WHEN km.metric_code = 'email_campaign_ctr' THEN kdp.value END) AS email_ctr,
  MAX(CASE WHEN km.metric_code = 'website_conversion_rate' THEN kdp.value END) AS website_conversion,
  MAX(CASE WHEN km.metric_code = 'paid_ad_roas' THEN kdp.value END) AS ad_roas,
  
  -- Audience Insights
  MAX(CASE WHEN km.metric_code = 'first_time_vs_repeat_ratio' THEN kdp.value END) AS first_time_ratio,
  MAX(CASE WHEN km.metric_code = 'friend_referral_rate' THEN kdp.value END) AS referral_rate,
  
  -- Brand Metrics
  MAX(CASE WHEN km.metric_code = 'nps' THEN kdp.value END) AS nps,
  MAX(CASE WHEN km.metric_code = 'brand_sentiment_score' THEN kdp.value END) AS brand_sentiment,
  MAX(CASE WHEN km.metric_code = 'marketing_cost_per_acquisition' THEN kdp.value END) AS marketing_cpa,
  
  MAX(kdp.measured_at) AS last_updated
FROM events e
LEFT JOIN kpi_data_points kdp ON e.id = kdp.event_id
LEFT JOIN kpi_metrics km ON kdp.metric_id = km.id
WHERE km.metric_category IN ('marketing_digital', 'marketing_audience', 'marketing_brand')
  AND e.start_date >= NOW() - INTERVAL '1 year'
GROUP BY e.id, e.name, e.start_date;

CREATE UNIQUE INDEX idx_mv_marketing_performance_event ON mv_marketing_performance(event_id);
CREATE INDEX idx_mv_marketing_performance_date ON mv_marketing_performance(event_date DESC);

-- =====================================================
-- CUSTOMER EXPERIENCE SUMMARY
-- =====================================================

CREATE MATERIALIZED VIEW mv_customer_experience AS
SELECT 
  e.id AS event_id,
  e.name AS event_name,
  e.start_date AS event_date,
  
  -- Experience Quality
  MAX(CASE WHEN km.metric_code = 'overall_satisfaction_score' THEN kdp.value END) AS overall_satisfaction,
  MAX(CASE WHEN km.metric_code = 'likelihood_to_recommend' THEN kdp.value END) AS likelihood_recommend,
  MAX(CASE WHEN km.metric_code = 'venue_experience_rating' THEN kdp.value END) AS venue_rating,
  MAX(CASE WHEN km.metric_code = 'sound_quality_rating' THEN kdp.value END) AS sound_rating,
  
  -- Customer Service
  MAX(CASE WHEN km.metric_code = 'support_ticket_resolution_time' THEN kdp.value END) AS resolution_time,
  MAX(CASE WHEN km.metric_code = 'first_contact_resolution_rate' THEN kdp.value END) AS first_contact_resolution,
  MAX(CASE WHEN km.metric_code = 'customer_complaint_rate' THEN kdp.value END) AS complaint_rate,
  
  -- Loyalty
  MAX(CASE WHEN km.metric_code = 'repeat_purchase_rate' THEN kdp.value END) AS repeat_purchase_rate,
  MAX(CASE WHEN km.metric_code = 'customer_churn_rate' THEN kdp.value END) AS churn_rate,
  
  MAX(kdp.measured_at) AS last_updated
FROM events e
LEFT JOIN kpi_data_points kdp ON e.id = kdp.event_id
LEFT JOIN kpi_metrics km ON kdp.metric_id = km.id
WHERE km.metric_category IN ('experience_quality', 'experience_service', 'experience_loyalty')
  AND e.start_date >= NOW() - INTERVAL '1 year'
GROUP BY e.id, e.name, e.start_date;

CREATE UNIQUE INDEX idx_mv_customer_experience_event ON mv_customer_experience(event_id);
CREATE INDEX idx_mv_customer_experience_date ON mv_customer_experience(event_date DESC);

-- =====================================================
-- EXECUTIVE DASHBOARD SUMMARY
-- =====================================================

-- Top-level KPIs for executive overview
CREATE MATERIALIZED VIEW mv_executive_dashboard AS
SELECT 
  e.id AS event_id,
  e.name AS event_name,
  e.start_date AS event_date,
  e.status AS event_status,
  
  -- Financial (Top 5)
  MAX(CASE WHEN km.metric_code = 'total_event_revenue' THEN kdp.value END) AS total_revenue,
  MAX(CASE WHEN km.metric_code = 'profit_margin_percentage' THEN kdp.value END) AS profit_margin,
  MAX(CASE WHEN km.metric_code = 'roi' THEN kdp.value END) AS roi,
  MAX(CASE WHEN km.metric_code = 'cost_per_attendee' THEN kdp.value END) AS cost_per_attendee,
  MAX(CASE WHEN km.metric_code = 'revenue_per_available_hour' THEN kdp.value END) AS revpah,
  
  -- Tickets (Top 5)
  MAX(CASE WHEN km.metric_code = 'sell_through_rate' THEN kdp.value END) AS sell_through_rate,
  MAX(CASE WHEN km.metric_code = 'attendance_rate' THEN kdp.value END) AS attendance_rate,
  MAX(CASE WHEN km.metric_code = 'average_ticket_price' THEN kdp.value END) AS avg_ticket_price,
  MAX(CASE WHEN km.metric_code = 'ticket_sales_conversion_rate' THEN kdp.value END) AS conversion_rate,
  MAX(CASE WHEN km.metric_code = 'early_bird_conversion_rate' THEN kdp.value END) AS early_bird_rate,
  
  -- Operations (Top 5)
  MAX(CASE WHEN km.metric_code = 'schedule_adherence_rate' THEN kdp.value END) AS schedule_adherence,
  MAX(CASE WHEN km.metric_code = 'task_completion_rate' THEN kdp.value END) AS task_completion,
  MAX(CASE WHEN km.metric_code = 'staff_to_attendee_ratio' THEN kdp.value END) AS staff_ratio,
  MAX(CASE WHEN km.metric_code = 'vendor_response_time' THEN kdp.value END) AS vendor_response_time,
  MAX(CASE WHEN km.metric_code = 'setup_time_efficiency' THEN kdp.value END) AS setup_efficiency,
  
  -- Marketing (Top 5)
  MAX(CASE WHEN km.metric_code = 'nps' THEN kdp.value END) AS nps,
  MAX(CASE WHEN km.metric_code = 'social_media_engagement_rate' THEN kdp.value END) AS social_engagement,
  MAX(CASE WHEN km.metric_code = 'email_campaign_ctr' THEN kdp.value END) AS email_ctr,
  MAX(CASE WHEN km.metric_code = 'marketing_cost_per_acquisition' THEN kdp.value END) AS marketing_cpa,
  MAX(CASE WHEN km.metric_code = 'brand_mention_velocity' THEN kdp.value END) AS brand_mentions,
  
  MAX(kdp.measured_at) AS last_updated
FROM events e
LEFT JOIN kpi_data_points kdp ON e.id = kdp.event_id
LEFT JOIN kpi_metrics km ON kdp.metric_id = km.id AND km.is_core_metric = true
WHERE e.start_date >= NOW() - INTERVAL '1 year'
GROUP BY e.id, e.name, e.start_date, e.status;

CREATE UNIQUE INDEX idx_mv_executive_dashboard_event ON mv_executive_dashboard(event_id);
CREATE INDEX idx_mv_executive_dashboard_date ON mv_executive_dashboard(event_date DESC);
CREATE INDEX idx_mv_executive_dashboard_status ON mv_executive_dashboard(event_status);

-- =====================================================
-- REFRESH FUNCTIONS
-- =====================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_kpi_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_event_kpi_latest;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_daily_trends;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_financial_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ticket_attendance_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_operational_efficiency;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_marketing_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_customer_experience;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_executive_dashboard;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh specific category views
CREATE OR REPLACE FUNCTION refresh_kpi_views_by_category(category TEXT)
RETURNS void AS $$
BEGIN
  CASE category
    WHEN 'financial' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_financial_performance;
    WHEN 'tickets' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ticket_attendance_summary;
    WHEN 'operations' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_operational_efficiency;
    WHEN 'marketing' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_marketing_performance;
    WHEN 'experience' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_customer_experience;
    WHEN 'executive' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_executive_dashboard;
    ELSE
      RAISE EXCEPTION 'Unknown category: %', category;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-refresh views when data points are inserted
CREATE OR REPLACE FUNCTION trigger_kpi_view_refresh()
RETURNS TRIGGER AS $$
BEGIN
  -- Schedule async refresh (implement with pg_cron or external scheduler)
  -- For now, we'll rely on scheduled refreshes
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kpi_data_points_refresh_trigger
AFTER INSERT OR UPDATE ON kpi_data_points
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_kpi_view_refresh();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON MATERIALIZED VIEW mv_event_kpi_latest IS 'Latest KPI values per event for real-time dashboards';
COMMENT ON MATERIALIZED VIEW mv_kpi_daily_trends IS 'Daily aggregated KPI trends for time-series analysis';
COMMENT ON MATERIALIZED VIEW mv_financial_performance IS 'Financial KPIs summary per event';
COMMENT ON MATERIALIZED VIEW mv_ticket_attendance_summary IS 'Ticket and attendance metrics per event';
COMMENT ON MATERIALIZED VIEW mv_operational_efficiency IS 'Operational efficiency metrics per event';
COMMENT ON MATERIALIZED VIEW mv_marketing_performance IS 'Marketing and engagement metrics per event';
COMMENT ON MATERIALIZED VIEW mv_customer_experience IS 'Customer experience and satisfaction metrics';
COMMENT ON MATERIALIZED VIEW mv_executive_dashboard IS 'Top 20 core KPIs for executive dashboard';
