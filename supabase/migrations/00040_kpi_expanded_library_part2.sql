-- =====================================================
-- GVTEWAY KPI Analytics - Expanded Library Part 2
-- Metrics 106-200
-- =====================================================

-- =====================================================
-- MARKETING & AUDIENCE ENGAGEMENT (30 Additional - 106-135)
-- =====================================================

INSERT INTO kpi_metrics (metric_name, metric_code, metric_category, description, calculation_method, unit_of_measurement, visualization_type, display_order) VALUES
('Website Conversion Rate', 'website_conversion_rate', 'marketing_digital', 'Purchases / Website visits × 100', '{"formula": "(purchases / visits) * 100", "sources": ["analytics"]}', 'percentage', 'percentage', 106),
('Landing Page Bounce Rate', 'landing_page_bounce_rate', 'marketing_digital', 'Single-page sessions / Total sessions', '{"formula": "(single_page / total) * 100", "sources": ["analytics"]}', 'percentage', 'percentage', 107),
('Email Open Rate', 'email_open_rate', 'marketing_digital', 'Opens / Emails delivered × 100', '{"formula": "(opens / delivered) * 100", "sources": ["email_campaigns"]}', 'percentage', 'percentage', 108),
('Email List Growth Rate', 'email_list_growth_rate', 'marketing_digital', 'New subscribers / Total subscribers × 100', '{"formula": "(new / total) * 100", "sources": ["email_lists"]}', 'percentage', 'percentage', 109),
('Social Media Follower Growth', 'social_media_follower_growth', 'marketing_digital', 'New followers / Period', '{"formula": "new_followers / days", "sources": ["social_media"]}', 'count', 'line_chart', 110),
('Paid Ad ROAS', 'paid_ad_roas', 'marketing_digital', 'Revenue from ads / Ad spend', '{"formula": "ad_revenue / ad_spend", "sources": ["ad_campaigns"]}', 'ratio', 'number', 111),
('Organic Search Traffic Percentage', 'organic_search_traffic_percentage', 'marketing_digital', 'Organic / Total traffic × 100', '{"formula": "(organic / total) * 100", "sources": ["analytics"]}', 'percentage', 'percentage', 112),
('Video View Completion Rate', 'video_view_completion_rate', 'marketing_digital', 'Completed views / Total views × 100', '{"formula": "(completed / total) * 100", "sources": ["video_analytics"]}', 'percentage', 'percentage', 113),
('Content Engagement Rate', 'content_engagement_rate', 'marketing_digital', 'Interactions / Reach × 100', '{"formula": "(interactions / reach) * 100", "sources": ["content_metrics"]}', 'percentage', 'percentage', 114),
('Influencer Campaign ROI', 'influencer_campaign_roi', 'marketing_digital', 'Revenue attributed / Influencer spend', '{"formula": "revenue / spend", "sources": ["influencer_campaigns"]}', 'ratio', 'number', 115),
('Audience Demographics Match', 'audience_demographics_match', 'marketing_audience', 'Target vs actual demographics', '{"formula": "calculate_demographic_match", "sources": ["attendees"]}', 'percentage', 'percentage', 116),
('Geographic Reach Diversity', 'geographic_reach_diversity', 'marketing_audience', 'Number of regions represented', '{"formula": "count(distinct_regions)", "sources": ["attendees"]}', 'count', 'number', 117),
('Age Distribution Index', 'age_distribution_index', 'marketing_audience', 'Attendee age breakdown percentages', '{"formula": "age_distribution", "sources": ["attendees"]}', 'distribution', 'pie_chart', 118),
('Gender Distribution', 'gender_distribution', 'marketing_audience', 'Gender breakdown of attendees', '{"formula": "gender_breakdown", "sources": ["attendees"]}', 'distribution', 'pie_chart', 119),
('Income Bracket Distribution', 'income_bracket_distribution', 'marketing_audience', 'Economic demographics', '{"formula": "income_distribution", "sources": ["attendees"]}', 'distribution', 'bar_chart', 120),
('Interest Affinity Score', 'interest_affinity_score', 'marketing_audience', 'Alignment with target interests', '{"formula": "calculate_affinity", "sources": ["attendees"]}', 'score', 'gauge', 121),
('Event Discovery Method', 'event_discovery_method', 'marketing_audience', 'How attendees found the event', '{"formula": "discovery_breakdown", "sources": ["surveys"]}', 'distribution', 'pie_chart', 122),
('First-Time vs Repeat Ratio', 'first_time_vs_repeat_ratio', 'marketing_audience', 'New attendees / Repeat attendees', '{"formula": "new / repeat", "sources": ["attendees"]}', 'ratio', 'number', 123),
('Friend Referral Rate', 'friend_referral_rate', 'marketing_audience', 'Referred tickets / Total sales × 100', '{"formula": "(referred / total) * 100", "sources": ["referrals"]}', 'percentage', 'percentage', 124),
('Community Engagement Score', 'community_engagement_score', 'marketing_audience', 'Local vs tourist attendance', '{"formula": "local / total * 100", "sources": ["attendees"]}', 'percentage', 'percentage', 125),
('Brand Awareness Lift', 'brand_awareness_lift', 'marketing_brand', 'Pre vs post-event brand recognition', '{"formula": "(post - pre) / pre * 100", "sources": ["brand_surveys"]}', 'percentage', 'percentage', 126),
('Brand Sentiment Score', 'brand_sentiment_score', 'marketing_brand', 'Positive mentions / Total mentions', '{"formula": "(positive / total) * 100", "sources": ["social_listening"]}', 'percentage', 'percentage', 127),
('User-Generated Content Volume', 'user_generated_content_volume', 'marketing_brand', 'Fan posts/photos/videos count', '{"formula": "count(ugc)", "sources": ["social_media"]}', 'count', 'number', 128),
('Hashtag Performance', 'hashtag_performance', 'marketing_brand', 'Unique uses of event hashtag', '{"formula": "count(hashtag_uses)", "sources": ["social_media"]}', 'count', 'number', 129),
('Media Impressions', 'media_impressions', 'marketing_brand', 'Total PR and media reach', '{"formula": "sum(impressions)", "sources": ["pr_coverage"]}', 'count', 'number', 130),
('Press Mention Sentiment', 'press_mention_sentiment', 'marketing_brand', 'Positive coverage percentage', '{"formula": "(positive / total) * 100", "sources": ["press_mentions"]}', 'percentage', 'percentage', 131),
('Partnership Brand Lift', 'partnership_brand_lift', 'marketing_brand', 'Sponsor brand awareness increase', '{"formula": "(post - pre) / pre * 100", "sources": ["sponsor_surveys"]}', 'percentage', 'percentage', 132),
('Event FOMO Factor', 'event_fomo_factor', 'marketing_brand', 'Waitlist size + social demand indicators', '{"formula": "calculate_fomo", "sources": ["waitlist", "social_media"]}', 'score', 'gauge', 133),
('Post-Event Engagement Duration', 'post_event_engagement_duration', 'marketing_brand', 'Days of continued engagement', '{"formula": "days_active_post_event", "sources": ["engagement_metrics"]}', 'days', 'number', 134),
('Content Virality Coefficient', 'content_virality_coefficient', 'marketing_brand', 'Shares per original post', '{"formula": "shares / posts", "sources": ["social_media"]}', 'ratio', 'number', 135);

-- =====================================================
-- CUSTOMER EXPERIENCE & SATISFACTION (25 Additional - 136-160)
-- =====================================================

INSERT INTO kpi_metrics (metric_name, metric_code, metric_category, description, calculation_method, unit_of_measurement, visualization_type, display_order) VALUES
('Overall Satisfaction Score', 'overall_satisfaction_score', 'experience_quality', 'Average rating (1-10 scale)', '{"formula": "avg(satisfaction_rating)", "sources": ["feedback"]}', 'score', 'gauge', 136),
('Likelihood to Recommend', 'likelihood_to_recommend', 'experience_quality', 'Would recommend percentage', '{"formula": "(would_recommend / total) * 100", "sources": ["feedback"]}', 'percentage', 'percentage', 137),
('Experience vs Expectation Gap', 'experience_vs_expectation_gap', 'experience_quality', 'Actual vs expected rating', '{"formula": "actual - expected", "sources": ["feedback"]}', 'score', 'number', 138),
('Venue Experience Rating', 'venue_experience_rating', 'experience_quality', 'Venue-specific satisfaction', '{"formula": "avg(venue_rating)", "sources": ["feedback"]}', 'score', 'gauge', 139),
('Sound Quality Rating', 'sound_quality_rating', 'experience_quality', 'Audio experience satisfaction', '{"formula": "avg(sound_rating)", "sources": ["feedback"]}', 'score', 'gauge', 140),
('Visual Production Rating', 'visual_production_rating', 'experience_quality', 'Lighting, screens, effects rating', '{"formula": "avg(visual_rating)", "sources": ["feedback"]}', 'score', 'gauge', 141),
('F&B Service Quality', 'fb_service_quality', 'experience_quality', 'Food and beverage satisfaction', '{"formula": "avg(fb_rating)", "sources": ["feedback"]}', 'score', 'gauge', 142),
('Restroom Cleanliness Score', 'restroom_cleanliness_score', 'experience_quality', 'Facilities rating', '{"formula": "avg(restroom_rating)", "sources": ["feedback"]}', 'score', 'gauge', 143),
('Parking Experience Rating', 'parking_experience_rating', 'experience_quality', 'Parking convenience and efficiency', '{"formula": "avg(parking_rating)", "sources": ["feedback"]}', 'score', 'gauge', 144),
('Accessibility Experience Score', 'accessibility_experience_score', 'experience_quality', 'ADA compliance satisfaction', '{"formula": "avg(accessibility_rating)", "sources": ["feedback"]}', 'score', 'gauge', 145),
('Support Ticket Resolution Time', 'support_ticket_resolution_time', 'experience_service', 'Average hours to resolve', '{"formula": "avg(resolution_hours)", "sources": ["support_tickets"]}', 'hours', 'number', 146),
('First Contact Resolution Rate', 'first_contact_resolution_rate', 'experience_service', 'Resolved on first contact / Total', '{"formula": "(first_contact / total) * 100", "sources": ["support_tickets"]}', 'percentage', 'percentage', 147),
('Customer Complaint Rate', 'customer_complaint_rate', 'experience_service', 'Complaints / Total attendees × 100', '{"formula": "(complaints / attendees) * 100", "sources": ["complaints"]}', 'percentage', 'percentage', 148),
('Refund Request Rate', 'refund_request_rate', 'experience_service', 'Refund requests / Total sales × 100', '{"formula": "(refunds / sales) * 100", "sources": ["transactions"]}', 'percentage', 'percentage', 149),
('Support Satisfaction Score', 'support_satisfaction_score', 'experience_service', 'Customer service rating', '{"formula": "avg(support_rating)", "sources": ["support_surveys"]}', 'score', 'gauge', 150),
('Live Chat Response Time', 'live_chat_response_time', 'experience_service', 'Average seconds to first response', '{"formula": "avg(response_seconds)", "sources": ["chat_logs"]}', 'seconds', 'number', 151),
('Self-Service Success Rate', 'self_service_success_rate', 'experience_service', 'Self-resolved / Total inquiries × 100', '{"formula": "(self_resolved / total) * 100", "sources": ["support"]}', 'percentage', 'percentage', 152),
('Escalation Rate', 'escalation_rate', 'experience_service', 'Escalated issues / Total tickets × 100', '{"formula": "(escalated / total) * 100", "sources": ["support_tickets"]}', 'percentage', 'percentage', 153),
('Follow-Up Completion Rate', 'follow_up_completion_rate', 'experience_service', 'Follow-ups completed / Required', '{"formula": "(completed / required) * 100", "sources": ["follow_ups"]}', 'percentage', 'percentage', 154),
('Service Recovery Success Rate', 'service_recovery_success_rate', 'experience_service', 'Satisfied after complaint resolution', '{"formula": "(satisfied / complaints) * 100", "sources": ["recovery_surveys"]}', 'percentage', 'percentage', 155),
('Repeat Purchase Rate', 'repeat_purchase_rate', 'experience_loyalty', 'Repeat buyers / Total customers × 100', '{"formula": "(repeat / total) * 100", "sources": ["customers"]}', 'percentage', 'percentage', 156),
('Customer Churn Rate', 'customer_churn_rate', 'experience_loyalty', 'Lost customers / Total customers × 100', '{"formula": "(lost / total) * 100", "sources": ["customers"]}', 'percentage', 'percentage', 157),
('Membership Renewal Rate', 'membership_renewal_rate', 'experience_loyalty', 'Renewals / Total memberships × 100', '{"formula": "(renewals / total) * 100", "sources": ["memberships"]}', 'percentage', 'percentage', 158),
('Loyalty Program Participation', 'loyalty_program_participation', 'experience_loyalty', 'Members / Total customers × 100', '{"formula": "(members / total) * 100", "sources": ["loyalty"]}', 'percentage', 'percentage', 159),
('Average Time Between Purchases', 'average_time_between_purchases', 'experience_loyalty', 'Days between event attendance', '{"formula": "avg(days_between)", "sources": ["transactions"]}', 'days', 'number', 160);

-- Continue with Safety, Sustainability, and Technology KPIs (161-200)...
