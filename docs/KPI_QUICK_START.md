# GVTEWAY KPI Analytics - Quick Start Guide

**Version**: 1.0.0  
**Last Updated**: January 10, 2025

---

## 🚀 Quick Start

### 1. Apply Database Migrations

```bash
# Navigate to project root
cd /Users/julianclarkson/Documents/Grasshopper26.00

# Apply all KPI migrations
npx supabase db push

# Or apply individually via psql
psql -h zunesxhsexrqjrroeass.supabase.co -U postgres -d postgres \
  -f supabase/migrations/00035_kpi_analytics_schema.sql

psql -h zunesxhsexrqjrroeass.supabase.co -U postgres -d postgres \
  -f supabase/migrations/00036_kpi_materialized_views.sql

psql -h zunesxhsexrqjrroeass.supabase.co -U postgres -d postgres \
  -f supabase/migrations/00037_kpi_calculation_functions.sql

psql -h zunesxhsexrqjrroeass.supabase.co -U postgres -d postgres \
  -f supabase/migrations/00038_kpi_metrics_seed_data.sql
```

### 2. Verify Installation

```sql
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'kpi%';

-- Check metrics seeded
SELECT COUNT(*) FROM kpi_metrics;
-- Should return 50+ metrics

-- Check materialized views
SELECT matviewname FROM pg_matviews 
WHERE schemaname = 'public';
-- Should return 8 views
```

### 3. Access the Dashboard

Navigate to: `http://localhost:3000/analytics/kpi`

---

## 📊 Using the KPI System

### Calculate KPIs for an Event

```typescript
import { kpiAnalyticsService } from '@/lib/services/kpi-analytics.service';

// Calculate all core KPIs
const result = await kpiAnalyticsService.calculateKPIs({
  event_id: 'your-event-uuid',
  force_recalculate: true
});

console.log(`Calculated ${result.data.length} KPIs`);

// Refresh materialized views
await kpiAnalyticsService.refreshViews();
```

### Get Dashboard Data

```typescript
// Get complete dashboard data
const dashboardData = await kpiAnalyticsService.getDashboardData({
  event_id: 'your-event-uuid',
  include_trends: true,
  include_targets: true
});

console.log(`Loaded ${dashboardData.metrics.length} metrics`);
console.log(`Found ${dashboardData.insights.length} insights`);
```

### Subscribe to Real-Time Updates

```typescript
// Set up real-time subscription
const subscription = kpiAnalyticsService.subscribeToKPIUpdates(
  'your-event-uuid',
  (payload) => {
    console.log('KPI updated:', payload);
    // Refresh your UI
  }
);

// Clean up when done
subscription.unsubscribe();
```

---

## 🎨 Using Components

### KPI Metric Card

```typescript
import { KPIMetricCard } from '@/design-system/components';

<KPIMetricCard
  metricCard={{
    metric: kpiMetric,
    current_value: 125000,
    trend: 'up',
    percentage_change: 15.5,
    target_value: 100000,
    comparison_period: 'vs last month',
    visualization: 'currency'
  }}
  size="medium"
  showTrend
  showTarget
  onClick={() => console.log('Metric clicked')}
/>
```

### Line Chart

```typescript
import { LineChart } from '@/design-system/components';

<LineChart
  title="Revenue Trend"
  subtitle="Last 30 days"
  data={{
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Revenue',
      data: [10000, 15000, 12000, 18000, 22000],
      borderColor: 'var(--color-primary-500)'
    }]
  }}
  height={300}
  showGrid
  showLegend
/>
```

### Bar Chart

```typescript
import { BarChart } from '@/design-system/components';

<BarChart
  title="Ticket Sales by Type"
  data={{
    labels: ['GA', 'VIP', 'Early Bird', 'Group'],
    datasets: [{
      label: 'Tickets Sold',
      data: [450, 120, 200, 80],
      backgroundColor: ['var(--color-primary-500)']
    }]
  }}
  height={300}
/>
```

### Pie Chart

```typescript
import { PieChart } from '@/design-system/components';

<PieChart
  title="Revenue Distribution"
  data={{
    labels: ['Tickets', 'Merchandise', 'F&B', 'Sponsorship'],
    datasets: [{
      data: [60, 15, 20, 5]
    }]
  }}
  height={300}
  showLegend
/>
```

### Gauge Chart

```typescript
import { GaugeChart } from '@/design-system/components';

<GaugeChart
  title="Sell-Through Rate"
  data={{
    value: 75,
    min: 0,
    max: 100,
    target: 80,
    thresholds: [
      { value: 0, color: 'var(--color-error-500)' },
      { value: 50, color: 'var(--color-warning-500)' },
      { value: 75, color: 'var(--color-success-500)' }
    ]
  }}
  height={250}
  showValue
  showTarget
/>
```

### Insights Panel

```typescript
import { InsightsPanel } from '@/design-system/components';

<InsightsPanel
  insights={insights}
  onAcknowledge={(insightId) => {
    kpiAnalyticsService.acknowledgeInsight(insightId, userId);
  }}
  maxVisible={5}
/>
```

---

## 🔌 API Endpoints

### GET /api/kpi/metrics

Get all KPI metrics or filter by category.

```bash
# Get all metrics
curl http://localhost:3000/api/kpi/metrics

# Get core metrics only
curl http://localhost:3000/api/kpi/metrics?core=true

# Get by category
curl http://localhost:3000/api/kpi/metrics?category=financial_revenue
```

### POST /api/kpi/calculate

Calculate KPIs for an event.

```bash
curl -X POST http://localhost:3000/api/kpi/calculate \
  -H "Content-Type: application/json" \
  -d '{"event_id": "your-event-uuid"}'
```

### GET /api/kpi/dashboard/[eventId]

Get complete dashboard data for an event.

```bash
curl http://localhost:3000/api/kpi/dashboard/your-event-uuid
```

---

## 📈 Core 20 KPIs Reference

### Financial Performance
1. **Total Event Revenue** - Sum of all revenue streams
2. **Cost Per Attendee** - Total costs / Total attendees
3. **Profit Margin %** - (Revenue - Costs) / Revenue × 100
4. **Revenue Per Available Hour** - Revenue / Event duration
5. **ROI** - (Net Profit / Investment) × 100

### Ticket & Attendance
6. **Ticket Sales Conversion Rate** - (Tickets sold / Visits) × 100
7. **Attendance Rate** - (Actual attendees / Tickets sold) × 100
8. **Average Ticket Price** - Total ticket revenue / Tickets sold
9. **Sell-Through Rate** - (Tickets sold / Capacity) × 100
10. **Early Bird Conversion Rate** - Early bird sales / Capacity × 100

### Operational Efficiency
11. **Staff-to-Attendee Ratio** - Total staff / Total attendees
12. **Setup Time Efficiency** - Planned / Actual setup time × 100
13. **Vendor Response Time** - Average hours for deliverables
14. **Schedule Adherence Rate** - (On-time milestones / Total) × 100
15. **Task Completion Rate** - Completed tasks / Total tasks × 100

### Marketing & Engagement
16. **Social Media Engagement Rate** - (Interactions / Impressions) × 100
17. **Email Campaign CTR** - (Clicks / Emails sent) × 100
18. **Net Promoter Score (NPS)** - % Promoters - % Detractors
19. **Brand Mention Velocity** - Mentions per day
20. **Marketing CPA** - Marketing spend / Tickets sold

---

## 🗄️ Database Schema Reference

### Key Tables

**kpi_metrics**
- Stores all 200 KPI metric definitions
- Fields: metric_name, metric_code, metric_category, calculation_method

**kpi_data_points**
- Time-series data for all KPI measurements
- Fields: metric_id, event_id, value, measured_at

**kpi_insights**
- AI-generated insights and recommendations
- Fields: insight_type, severity, insight_title, actionable_recommendations

**kpi_alerts**
- Alert configurations for threshold monitoring
- Fields: metric_id, condition_config, notification_channels

### Materialized Views

**mv_executive_dashboard**
- Top 20 core KPIs per event
- Refreshes automatically on data changes

**mv_financial_performance**
- All financial metrics aggregated
- Optimized for dashboard queries

**mv_ticket_attendance_summary**
- Ticket and attendance metrics
- Sub-50ms query performance

---

## 🔧 Maintenance

### Refresh Materialized Views

```sql
-- Refresh all views
SELECT refresh_all_kpi_views();

-- Refresh specific category
SELECT refresh_kpi_views_by_category('financial');
```

### Manual KPI Calculation

```sql
-- Calculate all core KPIs for an event
SELECT * FROM calculate_all_core_kpis('event-uuid');

-- Insert calculated value
SELECT upsert_kpi_data_point(
  'total_event_revenue',
  'event-uuid',
  125000.00,
  NOW(),
  'manual'
);
```

### View Performance Stats

```sql
-- Check view refresh times
SELECT 
  schemaname,
  matviewname,
  last_refresh
FROM pg_stat_user_tables
WHERE schemaname = 'public'
AND relname LIKE 'mv_%';

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND tablename LIKE 'kpi%'
ORDER BY idx_scan DESC;
```

---

## 🐛 Troubleshooting

### Dashboard Not Loading

1. Check migrations applied:
```sql
SELECT version FROM schema_migrations 
WHERE version >= '00035' 
ORDER BY version;
```

2. Verify metrics seeded:
```sql
SELECT COUNT(*) FROM kpi_metrics WHERE is_active = true;
```

3. Check materialized views:
```sql
SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';
```

### KPI Calculations Failing

1. Check calculation functions exist:
```sql
SELECT proname FROM pg_proc 
WHERE proname LIKE 'calculate_%';
```

2. Verify source data exists:
```sql
-- Check transactions table
SELECT COUNT(*) FROM transactions WHERE event_id = 'your-event-uuid';

-- Check event data
SELECT * FROM events WHERE id = 'your-event-uuid';
```

3. Test individual calculation:
```sql
SELECT calculate_total_event_revenue('your-event-uuid');
```

### Real-Time Updates Not Working

1. Check Supabase Realtime is enabled
2. Verify RLS policies allow access
3. Check subscription channel name matches event ID

---

## 📚 Additional Resources

- **Full Documentation**: `docs/KPI_ANALYTICS_IMPLEMENTATION.md`
- **Implementation Summary**: `docs/KPI_IMPLEMENTATION_SUMMARY.md`
- **API Documentation**: `docs/api/API_DOCUMENTATION.md`
- **Design System**: `docs/DESIGN_SYSTEM.md`

---

## 🎯 Next Steps

1. **Calculate Initial KPIs**: Run calculations for your events
2. **Customize Dashboard**: Create user-specific dashboard layouts
3. **Set Up Alerts**: Configure threshold alerts for critical metrics
4. **Generate Reports**: Use report builder for stakeholder reports
5. **Expand Metrics**: Add custom KPIs specific to your needs

---

## 💡 Tips & Best Practices

1. **Refresh Views Regularly**: Set up cron job for hourly view refresh
2. **Monitor Performance**: Track query times and optimize as needed
3. **Validate Calculations**: Spot-check KPI values against source data
4. **Use Benchmarks**: Compare against industry standards
5. **Document Custom Metrics**: Maintain clear calculation methodology

---

**Support**: support@gvteway.com  
**Documentation**: https://docs.gvteway.com/kpi-analytics  
**Status**: https://status.gvteway.com
