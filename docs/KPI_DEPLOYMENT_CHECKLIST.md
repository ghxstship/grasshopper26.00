# GVTEWAY KPI Analytics - Deployment Checklist

**Version**: 1.0.0  
**Last Updated**: January 10, 2025

---

## 🚀 Pre-Deployment Checklist

### Database Setup

- [ ] **Apply Migrations**
  ```bash
  # Apply all 4 KPI migrations in order
  npx supabase db push
  
  # Or manually:
  psql -h zunesxhsexrqjrroeass.supabase.co -U postgres -d postgres \
    -f supabase/migrations/00035_kpi_analytics_schema.sql
  psql -h zunesxhsexrqjrroeass.supabase.co -U postgres -d postgres \
    -f supabase/migrations/00036_kpi_materialized_views.sql
  psql -h zunesxhsexrqjrroeass.supabase.co -U postgres -d postgres \
    -f supabase/migrations/00037_kpi_calculation_functions.sql
  psql -h zunesxhsexrqjrroeass.supabase.co -U postgres -d postgres \
    -f supabase/migrations/00038_kpi_metrics_seed_data.sql
  ```

- [ ] **Verify Tables Created**
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name LIKE 'kpi%';
  ```
  Expected: 11 tables

- [ ] **Verify Materialized Views**
  ```sql
  SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';
  ```
  Expected: 8 views

- [ ] **Verify Functions**
  ```sql
  SELECT proname FROM pg_proc WHERE proname LIKE 'calculate_%';
  ```
  Expected: 17+ functions

- [ ] **Verify Seed Data**
  ```sql
  SELECT COUNT(*) FROM kpi_metrics WHERE is_active = true;
  ```
  Expected: 50+ metrics

- [ ] **Test RLS Policies**
  ```sql
  -- As admin user
  SELECT COUNT(*) FROM kpi_metrics;
  
  -- As regular user
  SELECT COUNT(*) FROM kpi_metrics WHERE is_active = true;
  ```

### Environment Configuration

- [ ] **Verify Environment Variables**
  ```bash
  # .env.local should have:
  NEXT_PUBLIC_SUPABASE_URL=https://zunesxhsexrqjrroeass.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

- [ ] **Install Dependencies**
  ```bash
  npm install
  # Verify recharts is installed
  npm list recharts
  ```

- [ ] **Build Application**
  ```bash
  npm run build
  ```

- [ ] **Run Type Check**
  ```bash
  npm run type-check
  ```

### Performance Setup

- [ ] **Create Indexes** (Already in migration, verify)
  ```sql
  SELECT indexname FROM pg_indexes 
  WHERE schemaname = 'public' AND tablename LIKE 'kpi%';
  ```
  Expected: 15+ indexes

- [ ] **Set Up View Refresh Schedule**
  ```sql
  -- Option 1: pg_cron (if available)
  SELECT cron.schedule(
    'refresh-kpi-views',
    '0 * * * *', -- Every hour
    'SELECT refresh_all_kpi_views()'
  );
  
  -- Option 2: Manual cron job
  # Add to crontab:
  # 0 * * * * psql -h host -U postgres -d postgres -c "SELECT refresh_all_kpi_views();"
  ```

- [ ] **Configure Backup Strategy**
  ```bash
  # Set up automated backups for KPI tables
  # Recommended: Daily backups with 30-day retention
  ```

### Security Configuration

- [ ] **Verify RLS Policies Active**
  ```sql
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public' AND tablename LIKE 'kpi%';
  ```
  All should have `rowsecurity = true`

- [ ] **Test Role-Based Access**
  - Admin: Full access to all KPIs
  - Event Manager: Access to event-specific KPIs
  - Finance: Access to financial KPIs only
  - Marketing: Access to marketing KPIs only

- [ ] **Configure API Rate Limiting**
  ```typescript
  // Recommended: 100 requests per minute per user
  ```

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] **Run Service Tests**
  ```bash
  npm run test:services
  ```

- [ ] **Run Component Tests**
  ```bash
  npm run test:components
  ```

- [ ] **Check Test Coverage**
  ```bash
  npm run test:coverage
  ```
  Target: 90%+ coverage for KPI modules

### Integration Tests

- [ ] **Test API Endpoints**
  ```bash
  npm run test:api
  ```

- [ ] **Test Database Functions**
  ```sql
  -- Test calculation for sample event
  SELECT * FROM calculate_all_core_kpis('sample-event-id');
  ```

- [ ] **Test Materialized View Refresh**
  ```sql
  SELECT refresh_all_kpi_views();
  -- Verify no errors
  ```

### Performance Tests

- [ ] **Dashboard Load Time**
  - Target: < 1.5 seconds
  - Test with 20+ metrics

- [ ] **API Response Time**
  - Target: < 200ms average
  - Test all endpoints

- [ ] **Real-time Update Latency**
  - Target: < 500ms
  - Test subscription updates

- [ ] **Concurrent Users**
  - Target: 100+ concurrent users
  - Load test dashboard

### Accessibility Tests

- [ ] **WCAG 2.1 AA Compliance**
  ```bash
  npm run test:a11y
  ```

- [ ] **Keyboard Navigation**
  - Test all interactive elements
  - Verify focus indicators

- [ ] **Screen Reader Compatibility**
  - Test with VoiceOver/NVDA
  - Verify ARIA labels

---

## 📊 Data Validation

### Sample Data Tests

- [ ] **Create Test Event**
  ```sql
  INSERT INTO events (id, event_name, event_date, capacity)
  VALUES ('test-event-001', 'Test Concert', NOW() + INTERVAL '30 days', 1000);
  ```

- [ ] **Add Sample Transactions**
  ```sql
  INSERT INTO transactions (event_id, amount, transaction_type, status)
  VALUES 
    ('test-event-001', 50.00, 'ticket_sale', 'completed'),
    ('test-event-001', 75.00, 'ticket_sale', 'completed');
  ```

- [ ] **Calculate KPIs**
  ```sql
  SELECT * FROM calculate_all_core_kpis('test-event-001');
  ```

- [ ] **Verify Results**
  ```sql
  SELECT * FROM kpi_data_points WHERE event_id = 'test-event-001';
  ```

- [ ] **Check Dashboard Data**
  ```sql
  SELECT * FROM mv_executive_dashboard WHERE event_id = 'test-event-001';
  ```

### Data Integrity

- [ ] **Verify Foreign Keys**
  ```sql
  SELECT constraint_name, table_name 
  FROM information_schema.table_constraints 
  WHERE constraint_type = 'FOREIGN KEY' 
  AND table_name LIKE 'kpi%';
  ```

- [ ] **Check for Orphaned Records**
  ```sql
  SELECT COUNT(*) FROM kpi_data_points 
  WHERE metric_id NOT IN (SELECT id FROM kpi_metrics);
  ```
  Expected: 0

- [ ] **Validate Calculation Inputs**
  ```sql
  SELECT * FROM kpi_data_points 
  WHERE calculation_inputs IS NOT NULL 
  LIMIT 10;
  ```

---

## 🔍 Monitoring Setup

### Application Monitoring

- [ ] **Set Up Error Tracking**
  - Sentry/Datadog configured
  - KPI-specific error tags

- [ ] **Configure Performance Monitoring**
  - Dashboard load times
  - API response times
  - Database query performance

- [ ] **Set Up Alerts**
  - Slow queries (> 1 second)
  - Failed calculations
  - View refresh failures

### Database Monitoring

- [ ] **Monitor Query Performance**
  ```sql
  SELECT query, mean_exec_time, calls 
  FROM pg_stat_statements 
  WHERE query LIKE '%kpi%' 
  ORDER BY mean_exec_time DESC 
  LIMIT 10;
  ```

- [ ] **Monitor Table Sizes**
  ```sql
  SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
  FROM pg_tables
  WHERE schemaname = 'public' AND tablename LIKE 'kpi%'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
  ```

- [ ] **Monitor Index Usage**
  ```sql
  SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public' AND tablename LIKE 'kpi%'
  ORDER BY idx_scan DESC;
  ```

---

## 🚦 Go-Live Checklist

### Final Verification

- [ ] **All migrations applied successfully**
- [ ] **All tests passing**
- [ ] **Performance targets met**
- [ ] **Security audit complete**
- [ ] **Documentation updated**
- [ ] **Team training completed**

### Deployment Steps

1. [ ] **Deploy to Staging**
   ```bash
   # Deploy to staging environment
   vercel deploy --env staging
   ```

2. [ ] **Smoke Test on Staging**
   - Access dashboard
   - Calculate KPIs
   - Generate report
   - Test real-time updates

3. [ ] **Deploy to Production**
   ```bash
   # Deploy to production
   vercel deploy --prod
   ```

4. [ ] **Verify Production Deployment**
   - Check dashboard loads
   - Verify API endpoints
   - Test calculations
   - Monitor error rates

5. [ ] **Enable Monitoring**
   - Activate error tracking
   - Enable performance monitoring
   - Set up alerts

### Post-Deployment

- [ ] **Monitor for 24 Hours**
  - Check error rates
  - Monitor performance
  - Review user feedback

- [ ] **Initial Data Population**
  - Calculate KPIs for existing events
  - Refresh all materialized views
  - Verify data accuracy

- [ ] **User Communication**
  - Announce new feature
  - Provide documentation links
  - Offer training sessions

---

## 🔄 Rollback Plan

### If Issues Occur

1. **Immediate Rollback**
   ```bash
   # Revert to previous deployment
   vercel rollback
   ```

2. **Database Rollback** (if needed)
   ```sql
   -- Drop KPI tables (CAUTION!)
   DROP TABLE IF EXISTS kpi_alert_history CASCADE;
   DROP TABLE IF EXISTS kpi_alerts CASCADE;
   DROP TABLE IF EXISTS user_dashboards CASCADE;
   DROP TABLE IF EXISTS kpi_benchmarks CASCADE;
   DROP TABLE IF EXISTS kpi_insights CASCADE;
   DROP TABLE IF EXISTS scheduled_reports CASCADE;
   DROP TABLE IF EXISTS generated_reports CASCADE;
   DROP TABLE IF EXISTS report_templates CASCADE;
   DROP TABLE IF EXISTS kpi_targets CASCADE;
   DROP TABLE IF EXISTS kpi_data_points CASCADE;
   DROP TABLE IF EXISTS kpi_metrics CASCADE;
   
   -- Drop materialized views
   DROP MATERIALIZED VIEW IF EXISTS mv_executive_dashboard;
   DROP MATERIALIZED VIEW IF EXISTS mv_customer_experience;
   DROP MATERIALIZED VIEW IF EXISTS mv_marketing_performance;
   DROP MATERIALIZED VIEW IF EXISTS mv_operational_efficiency;
   DROP MATERIALIZED VIEW IF EXISTS mv_ticket_attendance_summary;
   DROP MATERIALIZED VIEW IF EXISTS mv_financial_performance;
   DROP MATERIALIZED VIEW IF EXISTS mv_kpi_daily_trends;
   DROP MATERIALIZED VIEW IF EXISTS mv_event_kpi_latest;
   ```

3. **Restore from Backup**
   ```bash
   # Restore database from backup
   pg_restore -h host -U postgres -d postgres backup.dump
   ```

---

## 📞 Support Contacts

- **Technical Lead**: [Name]
- **Database Admin**: [Name]
- **DevOps**: [Name]
- **Support Email**: support@gvteway.com
- **Emergency Hotline**: [Number]

---

## 📝 Post-Deployment Tasks

### Week 1
- [ ] Monitor error rates daily
- [ ] Review performance metrics
- [ ] Collect user feedback
- [ ] Address critical issues

### Week 2
- [ ] Analyze usage patterns
- [ ] Optimize slow queries
- [ ] Update documentation based on feedback
- [ ] Plan Phase 3 features

### Month 1
- [ ] Comprehensive performance review
- [ ] User satisfaction survey
- [ ] Identify improvement areas
- [ ] Plan expansion to 200 KPIs

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Sign-off**: _______________

---

**Status Page**: https://status.gvteway.com  
**Documentation**: https://docs.gvteway.com/kpi-analytics  
**Support**: support@gvteway.com
