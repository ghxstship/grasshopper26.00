-- =====================================================
-- GVTEWAY KPI Analytics - Calculation Functions
-- Core KPI calculation logic and stored procedures
-- =====================================================

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Safe division to handle zero denominators
CREATE OR REPLACE FUNCTION safe_divide(numerator DECIMAL, denominator DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  IF denominator = 0 OR denominator IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN numerator / denominator;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate percentage
CREATE OR REPLACE FUNCTION calculate_percentage(part DECIMAL, whole DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  RETURN safe_divide(part, whole) * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate percentage change
CREATE OR REPLACE FUNCTION calculate_percentage_change(current_value DECIMAL, previous_value DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  IF previous_value = 0 OR previous_value IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN ((current_value - previous_value) / ABS(previous_value)) * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Determine trend direction
CREATE OR REPLACE FUNCTION determine_trend(current_value DECIMAL, previous_value DECIMAL, threshold DECIMAL DEFAULT 0.01)
RETURNS trend_direction AS $$
DECLARE
  change_pct DECIMAL;
BEGIN
  IF current_value IS NULL OR previous_value IS NULL THEN
    RETURN 'unknown';
  END IF;
  
  change_pct := ABS(calculate_percentage_change(current_value, previous_value));
  
  IF change_pct < threshold THEN
    RETURN 'stable';
  ELSIF current_value > previous_value THEN
    RETURN 'up';
  ELSE
    RETURN 'down';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- FINANCIAL KPI CALCULATIONS
-- =====================================================

-- Calculate Total Event Revenue
CREATE OR REPLACE FUNCTION calculate_total_event_revenue(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_total_revenue DECIMAL;
BEGIN
  SELECT 
    COALESCE(SUM(amount), 0)
  INTO v_total_revenue
  FROM transactions
  WHERE event_id = p_event_id
    AND status = 'completed'
    AND transaction_type IN ('ticket_sale', 'merchandise', 'food_beverage', 'vip_upgrade', 'sponsorship');
  
  RETURN v_total_revenue;
END;
$$ LANGUAGE plpgsql;

-- Calculate Cost Per Attendee
CREATE OR REPLACE FUNCTION calculate_cost_per_attendee(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_total_costs DECIMAL;
  v_total_attendees INTEGER;
BEGIN
  -- Get total costs
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_costs
  FROM event_expenses
  WHERE event_id = p_event_id;
  
  -- Get total attendees (actual check-ins)
  SELECT COUNT(DISTINCT user_id)
  INTO v_total_attendees
  FROM event_check_ins
  WHERE event_id = p_event_id
    AND checked_in = true;
  
  RETURN safe_divide(v_total_costs, v_total_attendees);
END;
$$ LANGUAGE plpgsql;

-- Calculate Profit Margin Percentage
CREATE OR REPLACE FUNCTION calculate_profit_margin(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_revenue DECIMAL;
  v_costs DECIMAL;
BEGIN
  v_revenue := calculate_total_event_revenue(p_event_id);
  
  SELECT COALESCE(SUM(amount), 0)
  INTO v_costs
  FROM event_expenses
  WHERE event_id = p_event_id;
  
  IF v_revenue = 0 THEN
    RETURN NULL;
  END IF;
  
  RETURN ((v_revenue - v_costs) / v_revenue) * 100;
END;
$$ LANGUAGE plpgsql;

-- Calculate ROI
CREATE OR REPLACE FUNCTION calculate_roi(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_revenue DECIMAL;
  v_investment DECIMAL;
  v_net_profit DECIMAL;
BEGIN
  v_revenue := calculate_total_event_revenue(p_event_id);
  
  SELECT COALESCE(SUM(amount), 0)
  INTO v_investment
  FROM event_expenses
  WHERE event_id = p_event_id;
  
  v_net_profit := v_revenue - v_investment;
  
  RETURN safe_divide(v_net_profit, v_investment) * 100;
END;
$$ LANGUAGE plpgsql;

-- Calculate Revenue Per Available Hour
CREATE OR REPLACE FUNCTION calculate_revpah(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_revenue DECIMAL;
  v_duration_hours DECIMAL;
  v_start_time TIMESTAMPTZ;
  v_end_time TIMESTAMPTZ;
BEGIN
  v_revenue := calculate_total_event_revenue(p_event_id);
  
  SELECT event_date, end_time
  INTO v_start_time, v_end_time
  FROM events
  WHERE id = p_event_id;
  
  IF v_end_time IS NULL THEN
    RETURN NULL;
  END IF;
  
  v_duration_hours := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) / 3600;
  
  RETURN safe_divide(v_revenue, v_duration_hours);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TICKET & ATTENDANCE KPI CALCULATIONS
-- =====================================================

-- Calculate Ticket Sales Conversion Rate
CREATE OR REPLACE FUNCTION calculate_ticket_conversion_rate(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_tickets_sold INTEGER;
  v_total_visits INTEGER;
BEGIN
  -- Count completed ticket purchases
  SELECT COUNT(*)
  INTO v_tickets_sold
  FROM transactions
  WHERE event_id = p_event_id
    AND transaction_type = 'ticket_sale'
    AND status = 'completed';
  
  -- Count unique website visits (would need analytics integration)
  -- For now, use a proxy metric
  SELECT COUNT(DISTINCT user_id)
  INTO v_total_visits
  FROM event_views
  WHERE event_id = p_event_id;
  
  RETURN calculate_percentage(v_tickets_sold, v_total_visits);
END;
$$ LANGUAGE plpgsql;

-- Calculate Attendance Rate
CREATE OR REPLACE FUNCTION calculate_attendance_rate(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_actual_attendees INTEGER;
  v_tickets_sold INTEGER;
BEGIN
  SELECT COUNT(DISTINCT user_id)
  INTO v_actual_attendees
  FROM event_check_ins
  WHERE event_id = p_event_id
    AND checked_in = true;
  
  SELECT COUNT(*)
  INTO v_tickets_sold
  FROM transactions
  WHERE event_id = p_event_id
    AND transaction_type = 'ticket_sale'
    AND status = 'completed';
  
  RETURN calculate_percentage(v_actual_attendees, v_tickets_sold);
END;
$$ LANGUAGE plpgsql;

-- Calculate Average Ticket Price
CREATE OR REPLACE FUNCTION calculate_average_ticket_price(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_total_revenue DECIMAL;
  v_tickets_sold INTEGER;
BEGIN
  SELECT 
    COALESCE(SUM(amount), 0),
    COUNT(*)
  INTO v_total_revenue, v_tickets_sold
  FROM transactions
  WHERE event_id = p_event_id
    AND transaction_type = 'ticket_sale'
    AND status = 'completed';
  
  RETURN safe_divide(v_total_revenue, v_tickets_sold);
END;
$$ LANGUAGE plpgsql;

-- Calculate Sell-Through Rate
CREATE OR REPLACE FUNCTION calculate_sell_through_rate(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_tickets_sold INTEGER;
  v_capacity INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_tickets_sold
  FROM transactions
  WHERE event_id = p_event_id
    AND transaction_type = 'ticket_sale'
    AND status = 'completed';
  
  SELECT capacity
  INTO v_capacity
  FROM events
  WHERE id = p_event_id;
  
  RETURN calculate_percentage(v_tickets_sold, v_capacity);
END;
$$ LANGUAGE plpgsql;

-- Calculate Early Bird Conversion Rate
CREATE OR REPLACE FUNCTION calculate_early_bird_rate(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_early_bird_sales INTEGER;
  v_capacity INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_early_bird_sales
  FROM transactions t
  INNER JOIN events e ON t.event_id = e.id
  WHERE t.event_id = p_event_id
    AND t.transaction_type = 'ticket_sale'
    AND t.status = 'completed'
    AND t.created_at < (e.event_date - INTERVAL '30 days'); -- Early bird = 30+ days before event
  
  SELECT capacity
  INTO v_capacity
  FROM events
  WHERE id = p_event_id;
  
  RETURN calculate_percentage(v_early_bird_sales, v_capacity);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- OPERATIONAL KPI CALCULATIONS
-- =====================================================

-- Calculate Staff-to-Attendee Ratio
CREATE OR REPLACE FUNCTION calculate_staff_ratio(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_staff_count INTEGER;
  v_attendee_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT user_id)
  INTO v_staff_count
  FROM event_staff
  WHERE event_id = p_event_id;
  
  SELECT COUNT(DISTINCT user_id)
  INTO v_attendee_count
  FROM event_check_ins
  WHERE event_id = p_event_id
    AND checked_in = true;
  
  RETURN safe_divide(v_staff_count, v_attendee_count);
END;
$$ LANGUAGE plpgsql;

-- Calculate Schedule Adherence Rate
CREATE OR REPLACE FUNCTION calculate_schedule_adherence(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_on_time_milestones INTEGER;
  v_total_milestones INTEGER;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE completed_at <= due_date),
    COUNT(*)
  INTO v_on_time_milestones, v_total_milestones
  FROM event_milestones
  WHERE event_id = p_event_id
    AND status = 'completed';
  
  RETURN calculate_percentage(v_on_time_milestones, v_total_milestones);
END;
$$ LANGUAGE plpgsql;

-- Calculate Task Completion Rate
CREATE OR REPLACE FUNCTION calculate_task_completion_rate(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_completed_tasks INTEGER;
  v_total_tasks INTEGER;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*)
  INTO v_completed_tasks, v_total_tasks
  FROM tasks
  WHERE event_id = p_event_id;
  
  RETURN calculate_percentage(v_completed_tasks, v_total_tasks);
END;
$$ LANGUAGE plpgsql;

-- Calculate Vendor Response Time (average hours)
CREATE OR REPLACE FUNCTION calculate_vendor_response_time(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_avg_response_hours DECIMAL;
BEGIN
  SELECT AVG(EXTRACT(EPOCH FROM (responded_at - requested_at)) / 3600)
  INTO v_avg_response_hours
  FROM vendor_requests
  WHERE event_id = p_event_id
    AND responded_at IS NOT NULL;
  
  RETURN v_avg_response_hours;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MARKETING KPI CALCULATIONS
-- =====================================================

-- Calculate Social Media Engagement Rate
CREATE OR REPLACE FUNCTION calculate_social_engagement_rate(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_interactions INTEGER;
  v_impressions INTEGER;
BEGIN
  SELECT 
    COALESCE(SUM((metadata->>'likes')::INTEGER + (metadata->>'comments')::INTEGER + (metadata->>'shares')::INTEGER), 0),
    COALESCE(SUM((metadata->>'impressions')::INTEGER), 0)
  INTO v_interactions, v_impressions
  FROM social_media_posts
  WHERE event_id = p_event_id;
  
  RETURN calculate_percentage(v_interactions, v_impressions);
END;
$$ LANGUAGE plpgsql;

-- Calculate Email Campaign CTR
CREATE OR REPLACE FUNCTION calculate_email_ctr(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_clicks INTEGER;
  v_emails_sent INTEGER;
BEGIN
  SELECT 
    COALESCE(SUM((metadata->>'clicks')::INTEGER), 0),
    COALESCE(SUM((metadata->>'sent')::INTEGER), 0)
  INTO v_clicks, v_emails_sent
  FROM email_campaigns
  WHERE event_id = p_event_id;
  
  RETURN calculate_percentage(v_clicks, v_emails_sent);
END;
$$ LANGUAGE plpgsql;

-- Calculate NPS (Net Promoter Score)
CREATE OR REPLACE FUNCTION calculate_nps(p_event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_promoters INTEGER;
  v_detractors INTEGER;
  v_total_responses INTEGER;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE rating >= 9),
    COUNT(*) FILTER (WHERE rating <= 6),
    COUNT(*)
  INTO v_promoters, v_detractors, v_total_responses
  FROM event_feedback
  WHERE event_id = p_event_id
    AND rating IS NOT NULL;
  
  IF v_total_responses = 0 THEN
    RETURN NULL;
  END IF;
  
  RETURN (calculate_percentage(v_promoters, v_total_responses) - 
          calculate_percentage(v_detractors, v_total_responses));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- BATCH KPI CALCULATION FUNCTION
-- =====================================================

-- Calculate all core KPIs for an event
CREATE OR REPLACE FUNCTION calculate_all_core_kpis(p_event_id UUID)
RETURNS TABLE (
  metric_code TEXT,
  metric_value DECIMAL,
  calculated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'total_event_revenue'::TEXT,
    calculate_total_event_revenue(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'cost_per_attendee'::TEXT,
    calculate_cost_per_attendee(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'profit_margin_percentage'::TEXT,
    calculate_profit_margin(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'roi'::TEXT,
    calculate_roi(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'revenue_per_available_hour'::TEXT,
    calculate_revpah(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'ticket_sales_conversion_rate'::TEXT,
    calculate_ticket_conversion_rate(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'attendance_rate'::TEXT,
    calculate_attendance_rate(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'average_ticket_price'::TEXT,
    calculate_average_ticket_price(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'sell_through_rate'::TEXT,
    calculate_sell_through_rate(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'early_bird_conversion_rate'::TEXT,
    calculate_early_bird_rate(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'staff_to_attendee_ratio'::TEXT,
    calculate_staff_ratio(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'schedule_adherence_rate'::TEXT,
    calculate_schedule_adherence(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'task_completion_rate'::TEXT,
    calculate_task_completion_rate(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'vendor_response_time'::TEXT,
    calculate_vendor_response_time(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'social_media_engagement_rate'::TEXT,
    calculate_social_engagement_rate(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'email_campaign_ctr'::TEXT,
    calculate_email_ctr(p_event_id),
    NOW()
  UNION ALL
  SELECT 
    'nps'::TEXT,
    calculate_nps(p_event_id),
    NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- KPI DATA POINT INSERTION FUNCTION
-- =====================================================

-- Insert or update KPI data point
CREATE OR REPLACE FUNCTION upsert_kpi_data_point(
  p_metric_code TEXT,
  p_event_id UUID,
  p_value DECIMAL,
  p_measured_at TIMESTAMPTZ DEFAULT NOW(),
  p_data_source TEXT DEFAULT 'calculated',
  p_calculation_inputs JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_metric_id UUID;
  v_data_point_id UUID;
BEGIN
  -- Get metric ID
  SELECT id INTO v_metric_id
  FROM kpi_metrics
  WHERE metric_code = p_metric_code;
  
  IF v_metric_id IS NULL THEN
    RAISE EXCEPTION 'Metric code % not found', p_metric_code;
  END IF;
  
  -- Insert data point
  INSERT INTO kpi_data_points (
    metric_id,
    event_id,
    value,
    measured_at,
    data_source,
    calculation_inputs
  ) VALUES (
    v_metric_id,
    p_event_id,
    p_value,
    p_measured_at,
    p_data_source,
    p_calculation_inputs
  )
  RETURNING id INTO v_data_point_id;
  
  RETURN v_data_point_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- AUTOMATED KPI CALCULATION TRIGGER
-- =====================================================

-- Function to auto-calculate KPIs when relevant data changes
CREATE OR REPLACE FUNCTION auto_calculate_event_kpis()
RETURNS TRIGGER AS $$
DECLARE
  v_event_id UUID;
BEGIN
  -- Determine event_id based on the table
  IF TG_TABLE_NAME = 'transactions' THEN
    v_event_id := NEW.event_id;
  ELSIF TG_TABLE_NAME = 'event_check_ins' THEN
    v_event_id := NEW.event_id;
  ELSIF TG_TABLE_NAME = 'event_expenses' THEN
    v_event_id := NEW.event_id;
  ELSE
    RETURN NEW;
  END IF;
  
  -- Schedule async KPI recalculation (implement with background job)
  -- For now, we'll rely on scheduled batch calculations
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER trigger_auto_calculate_kpis_orders
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION auto_calculate_event_kpis();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION calculate_total_event_revenue IS 'Calculates total revenue from all sources for an event';
COMMENT ON FUNCTION calculate_profit_margin IS 'Calculates profit margin percentage: (Revenue - Costs) / Revenue × 100';
COMMENT ON FUNCTION calculate_roi IS 'Calculates Return on Investment: (Net Profit / Investment) × 100';
COMMENT ON FUNCTION calculate_all_core_kpis IS 'Batch calculates all 20 core KPIs for an event';
COMMENT ON FUNCTION upsert_kpi_data_point IS 'Inserts a new KPI data point with audit trail';
