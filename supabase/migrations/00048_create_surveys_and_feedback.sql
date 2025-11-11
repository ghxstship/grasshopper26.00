-- ============================================================================
-- SURVEYS & FEEDBACK
-- Part of Super Expansion: Post-event feedback and surveys
-- ============================================================================

-- Surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Survey Details
  survey_name TEXT NOT NULL,
  survey_type TEXT CHECK (survey_type IN ('pre_event', 'post_event', 'nps', 'satisfaction', 'custom')),
  description TEXT,
  
  -- Questions
  questions JSONB NOT NULL,
  
  -- Distribution
  send_to TEXT CHECK (send_to IN ('all_attendees', 'ticket_purchasers', 'vip_only', 'custom_list')),
  send_time TIMESTAMPTZ,
  
  -- Response Tracking
  total_sent INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2),
  
  -- Average Scores
  average_rating DECIMAL(3,2),
  nps_score DECIMAL(5,2),
  
  -- Status
  survey_status TEXT NOT NULL DEFAULT 'draft' CHECK (survey_status IN (
    'draft',
    'scheduled',
    'active',
    'closed'
  )),
  
  -- Timeline
  open_date TIMESTAMPTZ,
  close_date TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey Responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id),
  
  -- Respondent (optional)
  respondent_id UUID REFERENCES auth.users(id),
  respondent_email TEXT,
  
  -- Responses
  answers JSONB NOT NULL,
  
  -- Metadata
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_to_complete_seconds INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_surveys_event ON surveys(event_id);
CREATE INDEX idx_surveys_org ON surveys(organization_id);
CREATE INDEX idx_surveys_status ON surveys(survey_status);

CREATE INDEX idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_event ON survey_responses(event_id);
CREATE INDEX idx_survey_responses_respondent ON survey_responses(respondent_id);

-- RLS Policies
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Surveys: Users can view surveys for their organization's events
CREATE POLICY "Users can view organization surveys"
  ON surveys FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Surveys: Event managers can manage surveys
CREATE POLICY "Event managers can manage surveys"
  ON surveys FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'event_manager', 'marketing_manager')
    )
  );

-- Survey Responses: Users can view responses for their surveys
CREATE POLICY "Users can view survey responses"
  ON survey_responses FOR SELECT
  USING (
    survey_id IN (
      SELECT id FROM surveys
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );

-- Survey Responses: Anyone can submit responses
CREATE POLICY "Anyone can submit survey responses"
  ON survey_responses FOR INSERT
  WITH CHECK (true);

-- Triggers
CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
