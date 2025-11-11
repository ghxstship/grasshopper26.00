-- ============================================================================
-- MARKETING CAMPAIGNS
-- Part of Super Expansion: Marketing and campaign tracking
-- ============================================================================

-- Marketing Campaigns table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Campaign Details
  campaign_name TEXT NOT NULL,
  campaign_slug TEXT NOT NULL,
  campaign_type TEXT CHECK (campaign_type IN ('email', 'social_media', 'paid_ads', 'influencer', 'pr', 'partnership', 'mixed')),
  
  -- Timeline
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Budget
  budgeted_amount DECIMAL(10,2),
  actual_spend DECIMAL(10,2) DEFAULT 0,
  
  -- Goals
  target_reach INTEGER,
  target_engagement INTEGER,
  target_conversions INTEGER,
  target_revenue DECIMAL(10,2),
  
  -- Performance Metrics
  actual_reach INTEGER DEFAULT 0,
  actual_engagement INTEGER DEFAULT 0,
  actual_conversions INTEGER DEFAULT 0,
  actual_revenue DECIMAL(10,2) DEFAULT 0,
  
  -- Engagement Breakdown
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  
  -- Conversion Metrics
  click_through_rate DECIMAL(5,2),
  conversion_rate DECIMAL(5,2),
  cost_per_click DECIMAL(10,2),
  cost_per_conversion DECIMAL(10,2),
  return_on_ad_spend DECIMAL(5,2),
  
  -- Content
  campaign_description TEXT,
  key_messages TEXT[],
  target_audience TEXT,
  creative_assets JSONB DEFAULT '[]',
  
  -- Status
  campaign_status TEXT NOT NULL DEFAULT 'planning' CHECK (campaign_status IN (
    'planning',
    'scheduled',
    'active',
    'paused',
    'completed',
    'cancelled'
  )),
  
  -- Owner
  campaign_manager_id UUID REFERENCES auth.users(id),
  
  -- Notes
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, campaign_slug)
);

-- Email Campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketing_campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- Email Details
  email_subject TEXT NOT NULL,
  email_preview_text TEXT,
  email_body TEXT NOT NULL,
  
  -- Recipients
  recipient_list_id UUID,
  total_recipients INTEGER,
  
  -- Sending
  scheduled_send_time TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Delivery Metrics
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  spam_complaints INTEGER DEFAULT 0,
  
  -- Calculated Metrics
  delivery_rate DECIMAL(5,2),
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  click_to_open_rate DECIMAL(5,2),
  unsubscribe_rate DECIMAL(5,2),
  
  -- Status
  campaign_status TEXT DEFAULT 'draft' CHECK (campaign_status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_marketing_campaigns_event ON marketing_campaigns(event_id);
CREATE INDEX idx_marketing_campaigns_org ON marketing_campaigns(organization_id);
CREATE INDEX idx_marketing_campaigns_status ON marketing_campaigns(campaign_status);
CREATE INDEX idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);
CREATE INDEX idx_marketing_campaigns_manager ON marketing_campaigns(campaign_manager_id);

CREATE INDEX idx_email_campaigns_marketing ON email_campaigns(marketing_campaign_id);
CREATE INDEX idx_email_campaigns_event ON email_campaigns(event_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(campaign_status);
CREATE INDEX idx_email_campaigns_sent ON email_campaigns(sent_at);

-- RLS Policies
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Marketing Campaigns: Users can view campaigns for their organization's events
CREATE POLICY "Users can view marketing campaigns"
  ON marketing_campaigns FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Marketing Campaigns: Marketing managers can manage campaigns
CREATE POLICY "Marketing managers can manage campaigns"
  ON marketing_campaigns FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'marketing_manager', 'event_manager')
    )
  );

-- Email Campaigns: Users can view email campaigns for their organization's events
CREATE POLICY "Users can view email campaigns"
  ON email_campaigns FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );

-- Email Campaigns: Marketing managers can manage email campaigns
CREATE POLICY "Marketing managers can manage email campaigns"
  ON email_campaigns FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
        AND role IN ('system_admin', 'organization_owner', 'marketing_manager', 'event_manager')
      )
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
