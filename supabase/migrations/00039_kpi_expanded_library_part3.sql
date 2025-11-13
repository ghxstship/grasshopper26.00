-- =====================================================
-- GVTEWAY KPI Analytics - Expanded Library Part 3
-- Metrics 161-200 (Final 40 KPIs)
-- =====================================================

-- =====================================================
-- SAFETY, RISK & COMPLIANCE (20 KPIs - 161-180)
-- =====================================================

INSERT INTO kpi_metrics (metric_name, metric_code, metric_category, description, calculation_method, unit_of_measurement, visualization_type, display_order) VALUES
('Incident-Free Event Percentage', 'incident_free_event_percentage', 'safety_security', 'No-incident events / Total events', '{"formula": "(incident_free / total) * 100", "sources": ["incidents"]}', 'percentage', 'percentage', 161),
('Medical Emergency Response Time', 'medical_emergency_response_time', 'safety_security', 'Average minutes to respond', '{"formula": "avg(response_minutes)", "sources": ["medical_incidents"]}', 'minutes', 'number', 162),
('Security Incident Rate', 'security_incident_rate', 'safety_security', 'Incidents / Total attendees × 100', '{"formula": "(incidents / attendees) * 100", "sources": ["security_incidents"]}', 'percentage', 'percentage', 163),
('Evacuation Drill Completion Rate', 'evacuation_drill_completion_rate', 'safety_security', 'Drills completed / Required', '{"formula": "(completed / required) * 100", "sources": ["drills"]}', 'percentage', 'percentage', 164),
('Safety Training Completion', 'safety_training_completion', 'safety_security', 'Trained staff / Total staff × 100', '{"formula": "(trained / total) * 100", "sources": ["training"]}', 'percentage', 'percentage', 165),
('First Aid Station Utilization', 'first_aid_station_utilization', 'safety_security', 'Visits / Total attendees × 100', '{"formula": "(visits / attendees) * 100", "sources": ["medical_logs"]}', 'percentage', 'percentage', 166),
('Crowd Density Safety Score', 'crowd_density_safety_score', 'safety_security', 'Peak density vs safe limits', '{"formula": "safe_limit / peak_density", "sources": ["crowd_monitoring"]}', 'ratio', 'gauge', 167),
('Security Staff-to-Attendee Ratio', 'security_staff_to_attendee_ratio', 'safety_security', 'Security personnel / Attendees', '{"formula": "security / attendees", "sources": ["staff", "check_ins"]}', 'ratio', 'number', 168),
('Lost and Found Recovery Rate', 'lost_and_found_recovery_rate', 'safety_security', 'Items returned / Items lost × 100', '{"formula": "(returned / lost) * 100", "sources": ["lost_found"]}', 'percentage', 'percentage', 169),
('Emergency Exit Accessibility Score', 'emergency_exit_accessibility_score', 'safety_security', 'Compliant exits / Required', '{"formula": "(compliant / required) * 100", "sources": ["safety_inspections"]}', 'percentage', 'percentage', 170),
('Insurance Claim Frequency', 'insurance_claim_frequency', 'safety_risk', 'Claims filed / Total events', '{"formula": "claims / events", "sources": ["insurance"]}', 'count', 'number', 171),
('Contract Dispute Rate', 'contract_dispute_rate', 'safety_risk', 'Disputes / Total contracts × 100', '{"formula": "(disputes / contracts) * 100", "sources": ["contracts"]}', 'percentage', 'percentage', 172),
('Weather Contingency Activation', 'weather_contingency_activation', 'safety_risk', 'Backup plan implementations', '{"formula": "count(activations)", "sources": ["contingency_plans"]}', 'count', 'number', 173),
('Force Majeure Event Impact', 'force_majeure_event_impact', 'safety_risk', 'Revenue lost to unforeseen events', '{"formula": "sum(lost_revenue)", "sources": ["force_majeure"]}', 'USD', 'currency', 174),
('Cybersecurity Incident Rate', 'cybersecurity_incident_rate', 'safety_risk', 'Security breaches / Total events', '{"formula": "breaches / events", "sources": ["security_logs"]}', 'count', 'number', 175),
('Payment Fraud Detection Rate', 'payment_fraud_detection_rate', 'safety_risk', 'Caught fraud / Total transactions', '{"formula": "(caught / total) * 100", "sources": ["fraud_detection"]}', 'percentage', 'percentage', 176),
('Data Breach Incidents', 'data_breach_incidents', 'safety_risk', 'Breaches per year', '{"formula": "count(breaches)", "sources": ["security_incidents"]}', 'count', 'number', 177),
('Legal Compliance Score', 'legal_compliance_score', 'safety_risk', 'Passed audits / Total audits × 100', '{"formula": "(passed / total) * 100", "sources": ["audits"]}', 'percentage', 'percentage', 178),
('Permit Approval Success Rate', 'permit_approval_success_rate', 'safety_risk', 'Approved / Submitted permits × 100', '{"formula": "(approved / submitted) * 100", "sources": ["permits"]}', 'percentage', 'percentage', 179),
('Alcohol Service Compliance', 'alcohol_service_compliance', 'safety_risk', 'ID checks / Total alcohol sales × 100', '{"formula": "(id_checks / sales) * 100", "sources": ["alcohol_service"]}', 'percentage', 'percentage', 180);

-- =====================================================
-- SUSTAINABILITY & SOCIAL IMPACT (10 KPIs - 181-190)
-- =====================================================

INSERT INTO kpi_metrics (metric_name, metric_code, metric_category, description, calculation_method, unit_of_measurement, visualization_type, display_order) VALUES
('Carbon Footprint Per Attendee', 'carbon_footprint_per_attendee', 'sustainability_environmental', 'Total CO2 / Attendees', '{"formula": "total_co2 / attendees", "sources": ["carbon_tracking"]}', 'kg', 'number', 181),
('Waste Diversion Rate', 'waste_diversion_rate', 'sustainability_environmental', 'Recycled/composted / Total waste × 100', '{"formula": "(diverted / total) * 100", "sources": ["waste_management"]}', 'percentage', 'percentage', 182),
('Energy Consumption Per Hour', 'energy_consumption_per_hour', 'sustainability_environmental', 'kWh used / Event hours', '{"formula": "kwh / hours", "sources": ["energy_monitoring"]}', 'kWh', 'number', 183),
('Water Usage Per Attendee', 'water_usage_per_attendee', 'sustainability_environmental', 'Gallons used / Attendees', '{"formula": "gallons / attendees", "sources": ["water_monitoring"]}', 'gallons', 'number', 184),
('Sustainable Vendor Percentage', 'sustainable_vendor_percentage', 'sustainability_environmental', 'Eco-certified / Total vendors × 100', '{"formula": "(certified / total) * 100", "sources": ["vendors"]}', 'percentage', 'percentage', 185),
('Public Transportation Usage', 'public_transportation_usage', 'sustainability_environmental', 'Attendees using transit / Total', '{"formula": "(transit / total) * 100", "sources": ["surveys"]}', 'percentage', 'percentage', 186),
('Reusable Material Percentage', 'reusable_material_percentage', 'sustainability_environmental', 'Reusable items / Total materials', '{"formula": "(reusable / total) * 100", "sources": ["materials"]}', 'percentage', 'percentage', 187),
('Local Sourcing Percentage', 'local_sourcing_percentage', 'sustainability_environmental', 'Local suppliers / Total suppliers × 100', '{"formula": "(local / total) * 100", "sources": ["suppliers"]}', 'percentage', 'percentage', 188),
('Local Employment Percentage', 'local_employment_percentage', 'sustainability_social', 'Local hires / Total staff × 100', '{"formula": "(local / total) * 100", "sources": ["staff"]}', 'percentage', 'percentage', 189),
('Charitable Contribution Amount', 'charitable_contribution_amount', 'sustainability_social', 'Donations made or raised', '{"formula": "sum(donations)", "sources": ["charitable_giving"]}', 'USD', 'currency', 190);

-- =====================================================
-- TECHNOLOGY & INNOVATION (10 KPIs - 191-200)
-- =====================================================

INSERT INTO kpi_metrics (metric_name, metric_code, metric_category, description, calculation_method, unit_of_measurement, visualization_type, display_order) VALUES
('App/Platform Uptime Percentage', 'platform_uptime_percentage', 'technology_performance', 'Available time / Total time × 100', '{"formula": "(uptime / total_time) * 100", "sources": ["monitoring"]}', 'percentage', 'gauge', 191),
('Mobile App Download Rate', 'mobile_app_download_rate', 'technology_performance', 'Downloads / Event attendees × 100', '{"formula": "(downloads / attendees) * 100", "sources": ["app_analytics"]}', 'percentage', 'percentage', 192),
('Platform Active User Rate', 'platform_active_user_rate', 'technology_performance', 'Active users / Registered users × 100', '{"formula": "(active / registered) * 100", "sources": ["user_analytics"]}', 'percentage', 'percentage', 193),
('Feature Adoption Rate', 'feature_adoption_rate', 'technology_performance', 'Feature users / Total users × 100', '{"formula": "(feature_users / total) * 100", "sources": ["feature_analytics"]}', 'percentage', 'percentage', 194),
('API Response Time', 'api_response_time', 'technology_performance', 'Average milliseconds for API calls', '{"formula": "avg(response_ms)", "sources": ["api_logs"]}', 'milliseconds', 'number', 195),
('Data Processing Accuracy', 'data_processing_accuracy', 'technology_performance', 'Correct records / Total records × 100', '{"formula": "(correct / total) * 100", "sources": ["data_quality"]}', 'percentage', 'percentage', 196),
('Integration Success Rate', 'integration_success_rate', 'technology_performance', 'Successful syncs / Total syncs × 100', '{"formula": "(successful / total) * 100", "sources": ["integrations"]}', 'percentage', 'percentage', 197),
('User Error Rate', 'user_error_rate', 'technology_performance', 'Errors encountered / Total actions', '{"formula": "(errors / actions) * 100", "sources": ["error_tracking"]}', 'percentage', 'percentage', 198),
('Technology Cost Per Attendee', 'technology_cost_per_attendee', 'technology_performance', 'Tech spend / Attendees', '{"formula": "tech_spend / attendees", "sources": ["expenses", "check_ins"]}', 'USD', 'currency', 199),
('Innovation ROI', 'innovation_roi', 'technology_performance', 'Revenue from new tech / Tech investment', '{"formula": "new_tech_revenue / investment", "sources": ["revenue_attribution", "expenses"]}', 'ratio', 'number', 200);

-- =====================================================
-- COMPLETE: All 200 KPI Metrics Now Defined
-- =====================================================

COMMENT ON TABLE kpi_metrics IS 'Complete library of 200 KPI metrics for GVTEWAY analytics - Fully implemented';
