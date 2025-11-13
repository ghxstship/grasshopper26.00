-- ============================================================================
-- DOCUMENTS & FILE MANAGEMENT
-- Part of Super Expansion: Document storage and version control
-- ============================================================================

-- Document Categories table
CREATE TABLE IF NOT EXISTS document_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  category_name TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  description TEXT,
  
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, category_slug)
);

-- Seed Default Document Categories
INSERT INTO document_categories (organization_id, category_name, category_slug, display_order) VALUES
(NULL, 'Contracts', 'contracts', 1),
(NULL, 'Invoices', 'invoices', 2),
(NULL, 'Receipts', 'receipts', 3),
(NULL, 'Permits & Licenses', 'permits-licenses', 4),
(NULL, 'Insurance Documents', 'insurance', 5),
(NULL, 'Riders & Addendums', 'riders', 6),
(NULL, 'Floor Plans', 'floor-plans', 7),
(NULL, 'Schedules', 'schedules', 8),
(NULL, 'Run Sheets', 'run-sheets', 9),
(NULL, 'Marketing Materials', 'marketing', 10)
ON CONFLICT DO NOTHING;

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES document_categories(id),
  
  -- Document Details
  document_name TEXT NOT NULL,
  document_type TEXT CHECK (document_type IN ('contract', 'invoice', 'receipt', 'permit', 'insurance', 'rider', 'floorplan', 'schedule', 'runsheet', 'other')),
  description TEXT,
  
  -- File Information
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  file_type TEXT,
  mime_type TEXT,
  
  -- Version Control
  version_number INTEGER DEFAULT 1,
  is_latest_version BOOLEAN DEFAULT true,
  supersedes_document_id UUID REFERENCES documents(id),
  
  -- Access Control
  is_public BOOLEAN DEFAULT false,
  access_level TEXT DEFAULT 'team' CHECK (access_level IN ('private', 'team', 'organization', 'public')),
  
  -- Status
  document_status TEXT DEFAULT 'draft' CHECK (document_status IN ('draft', 'review', 'approved', 'archived')),
  
  -- Approval
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Related Entities
  related_contract_id UUID REFERENCES contracts(id),
  related_vendor_id UUID REFERENCES vendors(id),
  
  -- Metadata
  tags TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_document_categories_org ON document_categories(organization_id);
CREATE INDEX idx_document_categories_slug ON document_categories(category_slug);

CREATE INDEX idx_documents_event ON documents(event_id);
CREATE INDEX idx_documents_org ON documents(organization_id);
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(document_status);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_contract ON documents(related_contract_id);
CREATE INDEX idx_documents_vendor ON documents(related_vendor_id);

-- RLS Policies
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Document Categories: Users can view categories
CREATE POLICY "Users can view document categories"
  ON document_categories FOR SELECT
  USING (
    organization_id IS NULL
    OR organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Document Categories: Managers can manage categories
CREATE POLICY "Managers can manage document categories"
  ON document_categories FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'event_manager')
    )
  );

-- Documents: Users can view accessible documents
CREATE POLICY "Users can view documents"
  ON documents FOR SELECT
  USING (
    -- Public documents
    is_public = true
    OR
    -- Organization documents
    (access_level = 'organization' AND organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    ))
    OR
    -- Team/Event documents
    (access_level IN ('team', 'private') AND (
      event_id IN (
        SELECT id FROM events
        WHERE organization_id IN (
          SELECT organization_id FROM user_organizations
          WHERE user_id = auth.uid()
        )
      )
      OR uploaded_by = auth.uid()
    ))
  );

-- Documents: Users can upload documents
CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Documents: Uploaders and managers can update
CREATE POLICY "Users can update their documents"
  ON documents FOR UPDATE
  USING (
    uploaded_by = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'event_manager')
    )
  );

-- Documents: Uploaders and managers can delete
CREATE POLICY "Users can delete their documents"
  ON documents FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
      AND role IN ('system_admin', 'organization_owner', 'event_manager')
    )
  );

-- Triggers
CREATE TRIGGER update_document_categories_updated_at
  BEFORE UPDATE ON document_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
