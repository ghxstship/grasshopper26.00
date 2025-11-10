-- =====================================================
-- GVTEWAY KPI Analytics - Expanded Library (150 Additional KPIs)
-- Metrics 51-200
-- =====================================================

-- =====================================================
-- TICKET & ATTENDANCE ANALYTICS (25 Additional - 51-75)
-- =====================================================

INSERT INTO kpi_metrics (metric_name, metric_code, metric_category, description, calculation_method, unit_of_measurement, visualization_type, display_order) VALUES
('Daily Ticket Sales Velocity', 'daily_ticket_sales_velocity', 'ticket_sales', 'Tickets sold per day', '{"formula": "tickets_sold / days_selling", "sources": ["transactions"]}', 'count', 'line_chart', 51),
('Peak Sales Period', 'peak_sales_period', 'ticket_sales', 'Highest sales concentration timeframe', '{"formula": "identify_peak_sales_window", "sources": ["transactions"]}', 'text', 'heatmap', 52),
('Ticket Type Distribution', 'ticket_type_distribution', 'ticket_sales', 'Percentage by GA/VIP/Tier', '{"formula": "ticket_type_breakdown", "sources": ["transactions"]}', 'percentage', 'pie_chart', 53),
('Group Sales Percentage', 'group_sales_percentage', 'ticket_sales', 'Group bookings / Total sales × 100', '{"formula": "(group_sales / total_sales) * 100", "sources": ["transactions"]}', 'percentage', 'percentage', 54),
('Discount Redemption Rate', 'discount_redemption_rate', 'ticket_sales', 'Discounted tickets / Total sold × 100', '{"formula": "(discounted_tickets / total_tickets) * 100", "sources": ["transactions"]}', 'percentage', 'percentage', 55),
('Waitlist Conversion Rate', 'waitlist_conversion_rate', 'ticket_sales', 'Converted / Total waitlist × 100', '{"formula": "(converted / total_waitlist) * 100", "sources": ["waitlist"]}', 'percentage', 'percentage', 56),
('Cart Abandonment Rate', 'cart_abandonment_rate', 'ticket_sales', 'Abandoned / Total carts × 100', '{"formula": "(abandoned / total_carts) * 100", "sources": ["cart_sessions"]}', 'percentage', 'percentage', 57),
('Mobile Ticket Sales Percentage', 'mobile_ticket_sales_percentage', 'ticket_sales', 'Mobile sales / Total sales × 100', '{"formula": "(mobile_sales / total_sales) * 100", "sources": ["transactions"]}', 'percentage', 'percentage', 58),
('International Attendee Percentage', 'international_attendee_percentage', 'ticket_attendance', 'International / Total × 100', '{"formula": "(international / total) * 100", "sources": ["attendees"]}', 'percentage', 'percentage', 59),
('Repeat Attendee Rate', 'repeat_attendee_rate', 'ticket_attendance', 'Returning attendees / Total × 100', '{"formula": "(returning / total) * 100", "sources": ["attendees"]}', 'percentage', 'percentage', 60),
('Capacity Utilization Rate', 'capacity_utilization_rate', 'ticket_attendance', 'Actual attendance / Max capacity × 100', '{"formula": "(actual / capacity) * 100", "sources": ["events", "check_ins"]}', 'percentage', 'gauge', 61),
('No-Show Rate', 'no_show_rate', 'ticket_attendance', 'No-shows / Tickets sold × 100', '{"formula": "(no_shows / tickets_sold) * 100", "sources": ["check_ins", "transactions"]}', 'percentage', 'percentage', 62),
('VIP Area Utilization', 'vip_area_utilization', 'ticket_attendance', 'VIP attendance / VIP capacity × 100', '{"formula": "(vip_attendance / vip_capacity) * 100", "sources": ["check_ins"]}', 'percentage', 'percentage', 63),
('Entry Processing Speed', 'entry_processing_speed', 'ticket_attendance', 'Attendees processed per minute', '{"formula": "attendees / entry_minutes", "sources": ["check_ins"]}', 'count', 'number', 64),
('Queue Wait Time Average', 'queue_wait_time_average', 'ticket_attendance', 'Average entry line wait time', '{"formula": "avg(wait_times)", "sources": ["queue_metrics"]}', 'minutes', 'number', 65),
('Price Elasticity', 'price_elasticity', 'ticket_pricing', 'Sales change / Price change', '{"formula": "(sales_change / price_change)", "sources": ["transactions"]}', 'ratio', 'number', 66),
('Optimal Price Point', 'optimal_price_point', 'ticket_pricing', 'Revenue-maximizing ticket price', '{"formula": "calculate_optimal_price", "sources": ["transactions"]}', 'USD', 'currency', 67),
('Tier Upgrade Rate', 'tier_upgrade_rate', 'ticket_pricing', 'Upgrades / Total sales × 100', '{"formula": "(upgrades / total_sales) * 100", "sources": ["transactions"]}', 'percentage', 'percentage', 68),
('Dynamic Pricing Effectiveness', 'dynamic_pricing_effectiveness', 'ticket_pricing', 'Revenue increase from dynamic pricing', '{"formula": "dynamic_revenue - static_revenue", "sources": ["transactions"]}', 'USD', 'currency', 69),
('Last-Minute Sales Percentage', 'last_minute_sales_percentage', 'ticket_sales', 'Sales in final 48 hours / Total', '{"formula": "(last_48h_sales / total_sales) * 100", "sources": ["transactions"]}', 'percentage', 'percentage', 70),
('Seat Turnover Rate', 'seat_turnover_rate', 'ticket_attendance', 'For multi-session events', '{"formula": "sessions / seats", "sources": ["sessions"]}', 'ratio', 'number', 71),
('Standing Area Density', 'standing_area_density', 'ticket_attendance', 'Attendees per square meter', '{"formula": "attendees / area_sqm", "sources": ["check_ins", "venues"]}', 'ratio', 'number', 72),
('Accessibility Accommodation Rate', 'accessibility_accommodation_rate', 'ticket_attendance', 'Requests fulfilled / Total requests', '{"formula": "(fulfilled / total_requests) * 100", "sources": ["accessibility_requests"]}', 'percentage', 'percentage', 73),
('Time-Based Attendance Distribution', 'time_based_attendance_distribution', 'ticket_attendance', 'Peak hours analysis', '{"formula": "attendance_by_hour", "sources": ["check_ins"]}', 'distribution', 'heatmap', 74),
('Oversold Capacity Percentage', 'oversold_capacity_percentage', 'ticket_sales', 'If applicable for standing events', '{"formula": "(sold - capacity) / capacity * 100", "sources": ["transactions", "events"]}', 'percentage', 'percentage', 75);

-- =====================================================
-- OPERATIONAL EXCELLENCE (30 Additional - 76-105)
-- =====================================================

INSERT INTO kpi_metrics (metric_name, metric_code, metric_category, description, calculation_method, unit_of_measurement, visualization_type, display_order) VALUES
('Project Timeline Adherence', 'project_timeline_adherence', 'operational_project', 'On-time completion / Total milestones', '{"formula": "(on_time / total) * 100", "sources": ["milestones"]}', 'percentage', 'percentage', 76),
('Change Order Frequency', 'change_order_frequency', 'operational_project', 'Change orders / Total project scope', '{"formula": "change_orders / total_scope", "sources": ["change_orders"]}', 'count', 'number', 77),
('Risk Mitigation Success Rate', 'risk_mitigation_success_rate', 'operational_project', 'Prevented risks / Identified risks', '{"formula": "(prevented / identified) * 100", "sources": ["risk_register"]}', 'percentage', 'percentage', 78),
('Milestone Completion Velocity', 'milestone_completion_velocity', 'operational_project', 'Days ahead/behind schedule', '{"formula": "planned_days - actual_days", "sources": ["milestones"]}', 'days', 'number', 79),
('Resource Allocation Efficiency', 'resource_allocation_efficiency', 'operational_project', 'Utilized / Allocated hours × 100', '{"formula": "(utilized / allocated) * 100", "sources": ["resources"]}', 'percentage', 'percentage', 80),
('Dependency Fulfillment Rate', 'dependency_fulfillment_rate', 'operational_project', 'Met dependencies / Total × 100', '{"formula": "(met / total) * 100", "sources": ["dependencies"]}', 'percentage', 'percentage', 81),
('Critical Path Variance', 'critical_path_variance', 'operational_project', 'Actual vs planned critical path days', '{"formula": "actual_days - planned_days", "sources": ["project_plan"]}', 'days', 'number', 82),
('Average Task Duration', 'average_task_duration', 'operational_project', 'Total task hours / Number of tasks', '{"formula": "total_hours / task_count", "sources": ["tasks"]}', 'hours', 'number', 83),
('Sprint Velocity', 'sprint_velocity', 'operational_project', 'Story points per sprint', '{"formula": "completed_points / sprint", "sources": ["sprints"]}', 'points', 'line_chart', 84),
('Blocker Resolution Time', 'blocker_resolution_time', 'operational_project', 'Average time to clear blockers', '{"formula": "avg(resolution_time)", "sources": ["blockers"]}', 'hours', 'number', 85),
('Staff Utilization Rate', 'staff_utilization_rate', 'operational_team', 'Billable hours / Total hours × 100', '{"formula": "(billable / total) * 100", "sources": ["timesheets"]}', 'percentage', 'percentage', 86),
('Employee Satisfaction Score', 'employee_satisfaction_score', 'operational_team', 'Post-event staff survey results', '{"formula": "avg(satisfaction_scores)", "sources": ["surveys"]}', 'score', 'gauge', 87),
('Training Completion Rate', 'training_completion_rate', 'operational_team', 'Staff trained / Total staff × 100', '{"formula": "(trained / total) * 100", "sources": ["training"]}', 'percentage', 'percentage', 88),
('Cross-Training Index', 'cross_training_index', 'operational_team', 'Staff with multiple skills / Total staff', '{"formula": "multi_skilled / total", "sources": ["staff_skills"]}', 'ratio', 'number', 89),
('Staff Turnover Rate', 'staff_turnover_rate', 'operational_team', 'Departures / Total staff × 100', '{"formula": "(departures / total) * 100", "sources": ["hr_records"]}', 'percentage', 'percentage', 90),
('Average Crew Experience Level', 'average_crew_experience_level', 'operational_team', 'Years of experience average', '{"formula": "avg(years_experience)", "sources": ["staff"]}', 'years', 'number', 91),
('Communication Response Time', 'communication_response_time', 'operational_team', 'Average response to messages', '{"formula": "avg(response_time)", "sources": ["communications"]}', 'minutes', 'number', 92),
('Incident Report Frequency', 'incident_report_frequency', 'operational_team', 'Safety incidents per event', '{"formula": "incidents / events", "sources": ["incidents"]}', 'count', 'number', 93),
('Staff Punctuality Rate', 'staff_punctuality_rate', 'operational_team', 'On-time arrivals / Total shifts × 100', '{"formula": "(on_time / total_shifts) * 100", "sources": ["attendance"]}', 'percentage', 'percentage', 94),
('Certification Compliance Rate', 'certification_compliance_rate', 'operational_team', 'Valid certs / Required certs × 100', '{"formula": "(valid / required) * 100", "sources": ["certifications"]}', 'percentage', 'percentage', 95),
('Vendor Reliability Score', 'vendor_reliability_score', 'operational_vendor', 'On-time deliveries / Total deliveries', '{"formula": "(on_time / total) * 100", "sources": ["vendor_deliveries"]}', 'percentage', 'percentage', 96),
('Supplier Lead Time', 'supplier_lead_time', 'operational_vendor', 'Average days from order to delivery', '{"formula": "avg(delivery_days)", "sources": ["orders"]}', 'days', 'number', 97),
('Contract Compliance Rate', 'contract_compliance_rate', 'operational_vendor', 'Met terms / Total contracts × 100', '{"formula": "(met / total) * 100", "sources": ["contracts"]}', 'percentage', 'percentage', 98),
('Vendor Cost Variance', 'vendor_cost_variance', 'operational_vendor', 'Budget vs actual vendor costs', '{"formula": "actual - budgeted", "sources": ["expenses"]}', 'USD', 'currency', 99),
('Quality Rejection Rate', 'quality_rejection_rate', 'operational_vendor', 'Rejected deliverables / Total × 100', '{"formula": "(rejected / total) * 100", "sources": ["quality_checks"]}', 'percentage', 'percentage', 100),
('Backup Vendor Activation Rate', 'backup_vendor_activation_rate', 'operational_vendor', 'Times backup vendors used', '{"formula": "backup_uses / events", "sources": ["vendor_usage"]}', 'count', 'number', 101),
('Vendor Dispute Resolution Time', 'vendor_dispute_resolution_time', 'operational_vendor', 'Average days to resolve issues', '{"formula": "avg(resolution_days)", "sources": ["disputes"]}', 'days', 'number', 102),
('Local Vendor Percentage', 'local_vendor_percentage', 'operational_vendor', 'Local vendors / Total vendors × 100', '{"formula": "(local / total) * 100", "sources": ["vendors"]}', 'percentage', 'percentage', 103),
('Sustainable Supplier Percentage', 'sustainable_supplier_percentage', 'operational_vendor', 'Certified sustainable vendors', '{"formula": "(sustainable / total) * 100", "sources": ["vendors"]}', 'percentage', 'percentage', 104),
('Vendor NPS', 'vendor_nps', 'operational_vendor', 'Net Promoter Score from vendor relationships', '{"formula": "promoters_pct - detractors_pct", "sources": ["vendor_surveys"]}', 'score', 'gauge', 105);

-- Continue with remaining KPIs (106-200) in next section...
-- This migration adds 55 additional KPIs (51-105)
-- Total KPIs so far: 105/200
