-- ============================================================================
-- PROJECT MANAGEMENT & TASKS
-- Part of Super Expansion: Comprehensive project management
-- ============================================================================

-- Project Phases table
CREATE TABLE IF NOT EXISTS project_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  phase_name TEXT NOT NULL,
  phase_slug TEXT NOT NULL,
  description TEXT,
  
  -- Timeline
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  
  -- Progress
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Display
  display_order INTEGER,
  color_hex TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, phase_slug)
);

-- Project Milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_phases(id),
  
  milestone_name TEXT NOT NULL,
  description TEXT,
  
  -- Timeline
  due_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Progress
  is_critical BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  
  -- Dependencies
  depends_on_milestone_ids UUID[],
  blocks_milestone_ids UUID[],
  
  -- Owner
  owner_id UUID REFERENCES auth.users(id),
  
  -- Display
  display_order INTEGER,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Categories table
CREATE TABLE IF NOT EXISTS task_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  category_name TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  color_hex TEXT,
  
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, category_slug)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_phases(id),
  milestone_id UUID REFERENCES project_milestones(id),
  category_id UUID REFERENCES task_categories(id),
  parent_task_id UUID REFERENCES tasks(id),
  
  -- Task Details
  task_name TEXT NOT NULL,
  description TEXT,
  
  -- Priority & Status
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  task_status TEXT NOT NULL DEFAULT 'todo' CHECK (task_status IN (
    'todo',
    'in_progress',
    'blocked',
    'in_review',
    'completed',
    'cancelled',
    'deferred'
  )),
  
  -- Timeline
  start_date DATE,
  due_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Time Tracking
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2) DEFAULT 0,
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  
  -- Dependencies
  depends_on_task_ids UUID[],
  blocks_task_ids UUID[],
  
  -- Completion
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Recurrence (for recurring tasks)
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  recurrence_end_date DATE,
  
  -- Checklist
  checklist JSONB DEFAULT '[]',
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- Metadata
  tags TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Time Details
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Work Description
  description TEXT,
  work_type TEXT CHECK (work_type IN ('regular', 'overtime', 'double_time', 'travel')),
  
  -- Billing
  is_billable BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  
  -- Approval
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Status
  entry_status TEXT DEFAULT 'draft' CHECK (entry_status IN ('draft', 'submitted', 'approved', 'rejected', 'invoiced')),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_project_phases_event ON project_phases(event_id);
CREATE INDEX idx_project_phases_active ON project_phases(is_active);

CREATE INDEX idx_project_milestones_event ON project_milestones(event_id);
CREATE INDEX idx_project_milestones_phase ON project_milestones(phase_id);
CREATE INDEX idx_project_milestones_owner ON project_milestones(owner_id);
CREATE INDEX idx_project_milestones_due_date ON project_milestones(due_date);
CREATE INDEX idx_project_milestones_completed ON project_milestones(is_completed);

CREATE INDEX idx_task_categories_org ON task_categories(organization_id);
CREATE INDEX idx_task_categories_active ON task_categories(is_active);

CREATE INDEX idx_tasks_event ON tasks(event_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(task_status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_phase ON tasks(phase_id);
CREATE INDEX idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX idx_tasks_category ON tasks(category_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);

CREATE INDEX idx_time_entries_event ON time_entries(event_id);
CREATE INDEX idx_time_entries_task ON time_entries(task_id);
CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_date ON time_entries(start_time);
CREATE INDEX idx_time_entries_status ON time_entries(entry_status);

-- RLS Policies
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Project Phases: Users can view phases for their organization's events
CREATE POLICY "Users can view project phases"
  ON project_phases FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );

-- Project Phases: Event managers can manage phases
CREATE POLICY "Event managers can manage project phases"
  ON project_phases FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
        AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator')
      )
    )
  );

-- Project Milestones: Users can view milestones for their organization's events
CREATE POLICY "Users can view project milestones"
  ON project_milestones FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );

-- Project Milestones: Event managers can manage milestones
CREATE POLICY "Event managers can manage project milestones"
  ON project_milestones FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
        AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator')
      )
    )
  );

-- Task Categories: Users can view categories for their organizations
CREATE POLICY "Users can view task categories"
  ON task_categories FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Task Categories: Event managers can manage categories
CREATE POLICY "Event managers can manage task categories"
  ON task_categories FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator')
    )
  );

-- Tasks: Users can view tasks for their organization's events or tasks assigned to them
CREATE POLICY "Users can view tasks"
  ON tasks FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
      )
    )
  );

-- Tasks: Event staff can manage tasks
CREATE POLICY "Event staff can manage tasks"
  ON tasks FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
        AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator', 'staff_member')
      )
    )
  );

-- Time Entries: Users can view their own time entries
CREATE POLICY "Users can view their own time entries"
  ON time_entries FOR SELECT
  USING (user_id = auth.uid());

-- Time Entries: Users can create their own time entries
CREATE POLICY "Users can create their own time entries"
  ON time_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Time Entries: Users can update their own draft time entries
CREATE POLICY "Users can update their own draft time entries"
  ON time_entries FOR UPDATE
  USING (user_id = auth.uid() AND entry_status = 'draft');

-- Time Entries: Managers can view and approve time entries for their events
CREATE POLICY "Managers can manage time entries"
  ON time_entries FOR ALL
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid()
        AND role IN ('system_admin', 'organization_owner', 'event_manager', 'production_coordinator', 'finance_manager')
      )
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_project_phases_updated_at
  BEFORE UPDATE ON project_phases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at
  BEFORE UPDATE ON project_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_categories_updated_at
  BEFORE UPDATE ON task_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
