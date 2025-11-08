-- Materialized views and functions for analytics and reporting

-- Event sales summary view
CREATE MATERIALIZED VIEW event_sales_summary AS
SELECT 
  e.id as event_id,
  e.name as event_name,
  e.start_date,
  e.status,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(DISTINCT t.id) as total_tickets_sold,
  SUM(o.total_amount) as total_revenue,
  AVG(o.total_amount) as average_order_value,
  COUNT(DISTINCT o.user_id) as unique_customers,
  json_agg(DISTINCT jsonb_build_object(
    'ticket_type', tt.name,
    'quantity_sold', tt.quantity_sold,
    'quantity_available', tt.quantity_available,
    'revenue', tt.price * tt.quantity_sold
  )) as ticket_type_breakdown
FROM events e
LEFT JOIN orders o ON e.id = o.event_id AND o.status = 'completed'
LEFT JOIN tickets t ON o.id = t.order_id
LEFT JOIN ticket_types tt ON e.id = tt.event_id
WHERE e.deleted_at IS NULL
GROUP BY e.id, e.name, e.start_date, e.status;

CREATE UNIQUE INDEX idx_event_sales_summary_event_id ON event_sales_summary(event_id);

-- Artist popularity metrics view
CREATE MATERIALIZED VIEW artist_popularity_metrics AS
SELECT 
  a.id as artist_id,
  a.name as artist_name,
  a.verified,
  COUNT(DISTINCT ea.event_id) as total_events,
  COUNT(DISTINCT ufa.user_id) as total_favorites,
  COUNT(DISTINCT o.id) as total_ticket_sales,
  SUM(o.total_amount) as total_revenue_generated,
  AVG(
    CASE WHEN ea.headliner THEN 1.0 ELSE 0.5 END
  ) as headliner_ratio,
  json_agg(DISTINCT a.genre_tags) as genres
FROM artists a
LEFT JOIN event_artists ea ON a.id = ea.artist_id
LEFT JOIN events e ON ea.event_id = e.id
LEFT JOIN orders o ON e.id = o.event_id AND o.status = 'completed'
LEFT JOIN user_favorite_artists ufa ON a.id = ufa.artist_id
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.name, a.verified;

CREATE UNIQUE INDEX idx_artist_popularity_metrics_artist_id ON artist_popularity_metrics(artist_id);

-- User engagement stats view
CREATE MATERIALIZED VIEW user_engagement_stats AS
SELECT 
  up.id as user_id,
  up.display_name,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.total_amount) as lifetime_value,
  COUNT(DISTINCT t.id) as total_tickets_purchased,
  COUNT(DISTINCT ufa.artist_id) as favorite_artists_count,
  COUNT(DISTINCT ues.id) as saved_schedules_count,
  up.loyalty_points,
  MAX(o.created_at) as last_purchase_date,
  MIN(o.created_at) as first_purchase_date,
  EXTRACT(EPOCH FROM (MAX(o.created_at) - MIN(o.created_at))) / 86400 as customer_lifetime_days,
  CASE 
    WHEN MAX(o.created_at) > NOW() - INTERVAL '30 days' THEN 'active'
    WHEN MAX(o.created_at) > NOW() - INTERVAL '90 days' THEN 'at_risk'
    ELSE 'churned'
  END as engagement_status
FROM user_profiles up
LEFT JOIN orders o ON up.id = o.user_id AND o.status = 'completed'
LEFT JOIN tickets t ON o.id = t.order_id
LEFT JOIN user_favorite_artists ufa ON up.id = ufa.user_id
LEFT JOIN user_event_schedules ues ON up.id = ues.user_id
WHERE up.deleted_at IS NULL
GROUP BY up.id, up.display_name, up.loyalty_points;

CREATE UNIQUE INDEX idx_user_engagement_stats_user_id ON user_engagement_stats(user_id);

-- Product performance view
CREATE MATERIALIZED VIEW product_performance AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.category,
  p.base_price,
  COUNT(DISTINCT pv.id) as variant_count,
  SUM(pv.stock_quantity) as total_stock,
  -- Note: This would need order_items tracking for actual sales
  0 as units_sold,
  0 as total_revenue,
  p.status,
  p.created_at
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.name, p.category, p.base_price, p.status, p.created_at;

CREATE UNIQUE INDEX idx_product_performance_product_id ON product_performance(product_id);

-- Daily revenue summary view
CREATE MATERIALIZED VIEW daily_revenue_summary AS
SELECT 
  DATE(o.created_at) as date,
  COUNT(DISTINCT o.id) as order_count,
  SUM(o.total_amount) as total_revenue,
  AVG(o.total_amount) as average_order_value,
  COUNT(DISTINCT o.user_id) as unique_customers,
  COUNT(DISTINCT o.event_id) as events_with_sales
FROM orders o
WHERE o.status = 'completed'
GROUP BY DATE(o.created_at)
ORDER BY date DESC;

CREATE UNIQUE INDEX idx_daily_revenue_summary_date ON daily_revenue_summary(date);

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY event_sales_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY artist_popularity_metrics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_engagement_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY product_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_revenue_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard KPIs
CREATE OR REPLACE FUNCTION get_dashboard_kpis(
  p_brand_id uuid DEFAULT NULL,
  p_start_date timestamptz DEFAULT NOW() - INTERVAL '30 days',
  p_end_date timestamptz DEFAULT NOW()
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_revenue', (
      SELECT COALESCE(SUM(total_amount), 0)
      FROM orders
      WHERE status = 'completed'
        AND created_at BETWEEN p_start_date AND p_end_date
        AND (p_brand_id IS NULL OR event_id IN (
          SELECT id FROM events WHERE brand_id = p_brand_id
        ))
    ),
    'total_orders', (
      SELECT COUNT(*)
      FROM orders
      WHERE status = 'completed'
        AND created_at BETWEEN p_start_date AND p_end_date
        AND (p_brand_id IS NULL OR event_id IN (
          SELECT id FROM events WHERE brand_id = p_brand_id
        ))
    ),
    'total_tickets_sold', (
      SELECT COUNT(*)
      FROM tickets t
      JOIN orders o ON t.order_id = o.id
      WHERE o.status = 'completed'
        AND o.created_at BETWEEN p_start_date AND p_end_date
        AND (p_brand_id IS NULL OR o.event_id IN (
          SELECT id FROM events WHERE brand_id = p_brand_id
        ))
    ),
    'active_events', (
      SELECT COUNT(*)
      FROM events
      WHERE status IN ('upcoming', 'on_sale')
        AND deleted_at IS NULL
        AND (p_brand_id IS NULL OR brand_id = p_brand_id)
    ),
    'new_users', (
      SELECT COUNT(*)
      FROM user_profiles
      WHERE created_at BETWEEN p_start_date AND p_end_date
    ),
    'average_order_value', (
      SELECT COALESCE(AVG(total_amount), 0)
      FROM orders
      WHERE status = 'completed'
        AND created_at BETWEEN p_start_date AND p_end_date
        AND (p_brand_id IS NULL OR event_id IN (
          SELECT id FROM events WHERE brand_id = p_brand_id
        ))
    ),
    'conversion_rate', (
      SELECT CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*) FILTER (WHERE status = 'completed')::float / COUNT(*)::float) * 100
        ELSE 0
      END
      FROM orders
      WHERE created_at BETWEEN p_start_date AND p_end_date
        AND (p_brand_id IS NULL OR event_id IN (
          SELECT id FROM events WHERE brand_id = p_brand_id
        ))
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get event performance report
CREATE OR REPLACE FUNCTION get_event_performance_report(p_event_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'event_id', e.id,
    'event_name', e.name,
    'status', e.status,
    'start_date', e.start_date,
    'capacity', e.capacity,
    'total_tickets_available', (
      SELECT COALESCE(SUM(quantity_available), 0)
      FROM ticket_types
      WHERE event_id = e.id
    ),
    'total_tickets_sold', (
      SELECT COALESCE(SUM(quantity_sold), 0)
      FROM ticket_types
      WHERE event_id = e.id
    ),
    'tickets_remaining', (
      SELECT COALESCE(SUM(quantity_available - quantity_sold), 0)
      FROM ticket_types
      WHERE event_id = e.id
    ),
    'sell_through_rate', (
      SELECT CASE 
        WHEN SUM(quantity_available) > 0 THEN
          (SUM(quantity_sold)::float / SUM(quantity_available)::float) * 100
        ELSE 0
      END
      FROM ticket_types
      WHERE event_id = e.id
    ),
    'total_revenue', (
      SELECT COALESCE(SUM(total_amount), 0)
      FROM orders
      WHERE event_id = e.id AND status = 'completed'
    ),
    'total_orders', (
      SELECT COUNT(*)
      FROM orders
      WHERE event_id = e.id AND status = 'completed'
    ),
    'unique_customers', (
      SELECT COUNT(DISTINCT user_id)
      FROM orders
      WHERE event_id = e.id AND status = 'completed'
    ),
    'average_order_value', (
      SELECT COALESCE(AVG(total_amount), 0)
      FROM orders
      WHERE event_id = e.id AND status = 'completed'
    ),
    'waitlist_count', (
      SELECT COUNT(*)
      FROM event_waitlist
      WHERE event_id = e.id AND status = 'active'
    ),
    'ticket_types', (
      SELECT json_agg(
        json_build_object(
          'name', tt.name,
          'price', tt.price,
          'quantity_available', tt.quantity_available,
          'quantity_sold', tt.quantity_sold,
          'revenue', tt.price * tt.quantity_sold,
          'sell_through', CASE 
            WHEN tt.quantity_available > 0 THEN
              (tt.quantity_sold::float / tt.quantity_available::float) * 100
            ELSE 0
          END
        )
      )
      FROM ticket_types tt
      WHERE tt.event_id = e.id
    )
  ) INTO result
  FROM events e
  WHERE e.id = p_event_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top performing artists
CREATE OR REPLACE FUNCTION get_top_artists(
  p_limit integer DEFAULT 10,
  p_metric text DEFAULT 'revenue' -- revenue, favorites, events
)
RETURNS TABLE (
  artist_id uuid,
  artist_name text,
  metric_value numeric,
  total_events integer,
  total_favorites integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    apm.artist_id,
    apm.artist_name,
    CASE p_metric
      WHEN 'revenue' THEN apm.total_revenue_generated
      WHEN 'favorites' THEN apm.total_favorites::numeric
      WHEN 'events' THEN apm.total_events::numeric
      ELSE apm.total_revenue_generated
    END as metric_value,
    apm.total_events,
    apm.total_favorites
  FROM artist_popularity_metrics apm
  ORDER BY metric_value DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule automatic refresh of materialized views (requires pg_cron extension)
-- This would be set up separately in production
-- SELECT cron.schedule('refresh-analytics', '0 */6 * * *', 'SELECT refresh_all_analytics_views()');
