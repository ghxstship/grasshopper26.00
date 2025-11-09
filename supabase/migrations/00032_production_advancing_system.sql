-- Production Advancing System Migration
-- Creates all tables for the ATLVS master catalog and production advance workflow

-- ============================================================================
-- ATLVS MASTER CATALOG STRUCTURE
-- ============================================================================

-- Catalog categories (top level organization)
create table if not exists catalog_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  icon text, -- geometric icon identifier
  description text,
  display_order integer,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Catalog items (individual products/services)
create table if not exists catalog_items (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references catalog_categories(id),
  name text not null,
  slug text unique not null,
  description text,
  item_type text, -- equipment, access, service, hospitality, travel, custom
  
  -- Equipment specific
  make text,
  model text,
  
  -- Specifications
  specifications jsonb,
  
  -- Availability
  total_quantity integer,
  available_quantity integer,
  
  -- Pricing (optional)
  base_price decimal(10,2),
  price_unit text, -- per_day, per_event, per_unit, etc.
  
  -- Media
  image_url text,
  thumbnail_url text,
  
  -- Metadata
  tags text[],
  requires_approval boolean default false,
  lead_time_days integer,
  
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Item modifiers/add-ons
create table if not exists catalog_item_modifiers (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references catalog_items(id) on delete cascade,
  name text not null,
  description text,
  modifier_type text, -- addon, option, configuration
  price_adjustment decimal(10,2),
  affects_quantity boolean default false,
  is_required boolean default false,
  display_order integer,
  created_at timestamptz default now()
);

-- Modifier options (for radio/select modifiers)
create table if not exists catalog_modifier_options (
  id uuid primary key default uuid_generate_v4(),
  modifier_id uuid references catalog_item_modifiers(id) on delete cascade,
  option_name text not null,
  option_value text not null,
  price_adjustment decimal(10,2),
  display_order integer,
  created_at timestamptz default now()
);

-- ============================================================================
-- PRODUCTION ADVANCE SYSTEM TABLES
-- ============================================================================

-- Production advance requests (the "order")
create table if not exists production_advances (
  id uuid primary key default uuid_generate_v4(),
  
  -- Request information
  advance_number text unique not null,
  
  -- Event & Company
  event_id uuid references events(id),
  event_name text not null,
  company_name text not null,
  
  -- Contact information
  submitter_user_id uuid references auth.users(id),
  point_of_contact_name text not null,
  point_of_contact_email text not null,
  point_of_contact_phone text,
  
  -- Timing
  service_start_date timestamptz not null,
  service_end_date timestamptz not null,
  duration_days integer generated always as (
    extract(day from (service_end_date - service_start_date)) + 1
  ) stored,
  
  -- Purpose & Notes
  purpose text,
  special_considerations text,
  additional_notes text,
  
  -- Status tracking
  status text not null default 'draft', -- draft, submitted, under_review, approved, rejected, fulfilled, cancelled
  approval_status text, -- pending, approved, rejected, partially_approved
  fulfillment_status text, -- pending, in_progress, partially_fulfilled, fulfilled, cancelled
  
  -- Admin fields
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  rejection_reason text,
  
  assigned_to_user_ids uuid[],
  internal_notes text,
  
  -- Totals
  total_items integer default 0,
  total_estimated_cost decimal(10,2),
  
  -- Timestamps
  submitted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Individual line items in an advance (cart items)
create table if not exists production_advance_items (
  id uuid primary key default uuid_generate_v4(),
  advance_id uuid references production_advances(id) on delete cascade,
  
  -- Catalog reference
  catalog_item_id uuid references catalog_items(id),
  
  -- Item details (denormalized for historical accuracy)
  category_name text not null,
  item_name text not null,
  item_description text,
  make text,
  model text,
  
  -- Quantity & Configuration
  quantity integer not null default 1,
  modifiers jsonb,
  
  -- Specific dates (can override advance dates)
  specific_start_date timestamptz,
  specific_end_date timestamptz,
  
  -- Item-specific notes
  item_notes text,
  
  -- Pricing (optional)
  unit_price decimal(10,2),
  total_price decimal(10,2),
  
  -- Fulfillment
  fulfillment_status text, -- pending, assigned, fulfilled, unavailable
  assigned_unit_ids uuid[],
  
  -- Display order in cart
  display_order integer,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Physical unit tracking (for equipment inventory)
create table if not exists physical_units (
  id uuid primary key default uuid_generate_v4(),
  catalog_item_id uuid references catalog_items(id),
  
  -- Unit identification
  unit_number text not null,
  serial_number text unique,
  asset_tag text unique,
  
  -- Condition
  condition text, -- excellent, good, fair, needs_repair
  last_maintenance_date date,
  next_maintenance_date date,
  
  -- Availability
  status text, -- available, in_use, maintenance, retired
  current_location text,
  
  -- Notes
  notes text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Unit assignments to advance items
create table if not exists advance_item_unit_assignments (
  id uuid primary key default uuid_generate_v4(),
  advance_item_id uuid references production_advance_items(id) on delete cascade,
  physical_unit_id uuid references physical_units(id),
  
  assigned_by uuid references auth.users(id),
  assigned_at timestamptz default now(),
  
  -- Checkout/return tracking
  checked_out_at timestamptz,
  checked_out_by uuid references auth.users(id),
  checked_in_at timestamptz,
  checked_in_by uuid references auth.users(id),
  
  -- Condition tracking
  condition_at_checkout text,
  condition_at_return text,
  damage_notes text,
  
  unique (advance_item_id, physical_unit_id)
);

-- Advance status history (audit trail)
create table if not exists production_advance_status_history (
  id uuid primary key default uuid_generate_v4(),
  advance_id uuid references production_advances(id) on delete cascade,
  
  from_status text,
  to_status text not null,
  
  changed_by uuid references auth.users(id),
  change_reason text,
  notes text,
  
  created_at timestamptz default now()
);

-- Advance comments/communication thread
create table if not exists production_advance_comments (
  id uuid primary key default uuid_generate_v4(),
  advance_id uuid references production_advances(id) on delete cascade,
  
  user_id uuid references auth.users(id),
  comment_text text not null,
  
  is_internal boolean default false,
  mentioned_user_ids uuid[],
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Recurring advance templates
create table if not exists advance_templates (
  id uuid primary key default uuid_generate_v4(),
  
  created_by uuid references auth.users(id),
  template_name text not null,
  description text,
  
  company_name text,
  
  -- Template items
  template_items jsonb,
  
  -- Default values
  default_purpose text,
  default_special_considerations text,
  
  is_public boolean default false,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

create index idx_advances_submitter on production_advances(submitter_user_id);
create index idx_advances_event on production_advances(event_id);
create index idx_advances_status on production_advances(status);
create index idx_advances_dates on production_advances(service_start_date, service_end_date);
create index idx_advance_items_advance on production_advance_items(advance_id);
create index idx_advance_items_catalog on production_advance_items(catalog_item_id);
create index idx_catalog_items_category on catalog_items(category_id);
create index idx_catalog_items_active on catalog_items(is_active);
create index idx_physical_units_item on physical_units(catalog_item_id);
create index idx_physical_units_status on physical_units(status);
create index idx_advance_comments_advance on production_advance_comments(advance_id);
create index idx_status_history_advance on production_advance_status_history(advance_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
alter table catalog_categories enable row level security;
alter table catalog_items enable row level security;
alter table catalog_item_modifiers enable row level security;
alter table catalog_modifier_options enable row level security;
alter table production_advances enable row level security;
alter table production_advance_items enable row level security;
alter table physical_units enable row level security;
alter table advance_item_unit_assignments enable row level security;
alter table production_advance_status_history enable row level security;
alter table production_advance_comments enable row level security;
alter table advance_templates enable row level security;

-- Catalog: Public read access for active items
create policy "Anyone can view active catalog categories"
  on catalog_categories for select
  using (is_active = true);

create policy "Anyone can view active catalog items"
  on catalog_items for select
  using (is_active = true);

create policy "Anyone can view item modifiers"
  on catalog_item_modifiers for select
  using (true);

create policy "Anyone can view modifier options"
  on catalog_modifier_options for select
  using (true);

-- Production Advances: Users can view their own, admins can view all
create policy "Users can view their own advances"
  on production_advances for select
  using (auth.uid() = submitter_user_id);

create policy "Event team leads can view all advances"
  on production_advances for select
  using (
    exists (
      select 1 from event_team_assignments eta
      WHERE eta.event_id = production_advances.event_id
      AND eta.user_id = auth.uid()
      AND eta.team_role = 'lead'
      AND eta.status = 'active'
    )
  );

create policy "Users can create their own advances"
  on production_advances for insert
  with check (auth.uid() = submitter_user_id);

create policy "Users can update their own draft advances"
  on production_advances for update
  using (auth.uid() = submitter_user_id and status = 'draft');

create policy "Event team leads can update any advance"
  on production_advances for update
  using (
    exists (
      select 1 from event_team_assignments eta
      WHERE eta.event_id = production_advances.event_id
      AND eta.user_id = auth.uid()
      AND eta.team_role = 'lead'
      AND eta.status = 'active'
    )
  );

-- Advance Items: Follow parent advance permissions
create policy "Users can view items from their advances"
  on production_advance_items for select
  using (
    exists (
      select 1 from production_advances
      where id = advance_id and submitter_user_id = auth.uid()
    )
  );

create policy "Event team leads can view all advance items"
  on production_advance_items for select
  using (
    exists (
      select 1 from production_advances pa
      join event_team_assignments eta on eta.event_id = pa.event_id
      where pa.id = advance_id
      and eta.user_id = auth.uid()
      and eta.team_role = 'lead'
      and eta.status = 'active'
    )
  );

create policy "Users can insert items to their advances"
  on production_advance_items for insert
  with check (
    exists (
      select 1 from production_advances
      where id = advance_id and submitter_user_id = auth.uid()
    )
  );

create policy "Users can update items in their draft advances"
  on production_advance_items for update
  using (
    exists (
      select 1 from production_advances
      where id = advance_id and submitter_user_id = auth.uid() and status = 'draft'
    )
  );

create policy "Users can delete items from their draft advances"
  on production_advance_items for delete
  using (
    exists (
      select 1 from production_advances
      where id = advance_id and submitter_user_id = auth.uid() and status = 'draft'
    )
  );

-- Physical Units: Event team leads only
create policy "Event team leads can manage physical units"
  on physical_units for all
  using (
    exists (
      select 1 from event_team_assignments eta
      where eta.user_id = auth.uid()
      and eta.team_role = 'lead'
      and eta.status = 'active'
    )
  );

-- Unit Assignments: Event team leads only
create policy "Event team leads can manage unit assignments"
  on advance_item_unit_assignments for all
  using (
    exists (
      select 1 from event_team_assignments eta
      where eta.user_id = auth.uid()
      and eta.team_role = 'lead'
      and eta.status = 'active'
    )
  );

-- Status History: Read for advance owners and admins
create policy "Users can view status history of their advances"
  on production_advance_status_history for select
  using (
    exists (
      select 1 from production_advances
      where id = advance_id and submitter_user_id = auth.uid()
    )
  );

create policy "Event team leads can view all status history"
  on production_advance_status_history for select
  using (
    exists (
      select 1 from production_advances pa
      join event_team_assignments eta on eta.event_id = pa.event_id
      where pa.id = advance_id
      and eta.user_id = auth.uid()
      and eta.team_role = 'lead'
      and eta.status = 'active'
    )
  );

create policy "Event team leads can insert status history"
  on production_advance_status_history for insert
  with check (
    exists (
      select 1 from production_advances pa
      join event_team_assignments eta on eta.event_id = pa.event_id
      where pa.id = advance_id
      and eta.user_id = auth.uid()
      and eta.team_role = 'lead'
      and eta.status = 'active'
    )
  );

-- Comments: Users can view and add comments to their advances
create policy "Users can view comments on their advances"
  on production_advance_comments for select
  using (
    exists (
      select 1 from production_advances
      where id = advance_id and submitter_user_id = auth.uid()
    )
    and (is_internal = false or exists (
      select 1 from production_advances pa
      join event_team_assignments eta on eta.event_id = pa.event_id
      where pa.id = advance_id
      and eta.user_id = auth.uid()
      and eta.team_role = 'lead'
      and eta.status = 'active'
    ))
  );

create policy "Event team leads can view all comments"
  on production_advance_comments for select
  using (
    exists (
      select 1 from production_advances pa
      join event_team_assignments eta on eta.event_id = pa.event_id
      where pa.id = advance_id
      and eta.user_id = auth.uid()
      and eta.team_role = 'lead'
      and eta.status = 'active'
    )
  );

create policy "Users can add comments to their advances"
  on production_advance_comments for insert
  with check (
    exists (
      select 1 from production_advances
      where id = advance_id and submitter_user_id = auth.uid()
    )
    or exists (
      select 1 from production_advances pa
      join event_team_assignments eta on eta.event_id = pa.event_id
      where pa.id = advance_id
      and eta.user_id = auth.uid()
      and eta.team_role = 'lead'
      and eta.status = 'active'
    )
  );

-- Templates: Users can view public templates and their own
create policy "Users can view public templates"
  on advance_templates for select
  using (is_public = true or created_by = auth.uid());

create policy "Users can create their own templates"
  on advance_templates for insert
  with check (created_by = auth.uid());

create policy "Users can update their own templates"
  on advance_templates for update
  using (created_by = auth.uid());

create policy "Users can delete their own templates"
  on advance_templates for delete
  using (created_by = auth.uid());

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Generate unique advance number
create or replace function generate_advance_number()
returns text
language plpgsql
as $$
declare
  new_number text;
  year_part text;
  sequence_part integer;
begin
  year_part := to_char(now(), 'YYYY');
  
  -- Get the next sequence number for this year
  select coalesce(max(
    cast(substring(advance_number from 'PA-' || year_part || '-(.*)') as integer)
  ), 0) + 1
  into sequence_part
  from production_advances
  where advance_number like 'PA-' || year_part || '-%';
  
  new_number := 'PA-' || year_part || '-' || lpad(sequence_part::text, 3, '0');
  
  return new_number;
end;
$$;

-- Update advance updated_at timestamp
create or replace function update_advance_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_production_advances_updated_at
  before update on production_advances
  for each row
  execute function update_advance_updated_at();

create trigger update_production_advance_items_updated_at
  before update on production_advance_items
  for each row
  execute function update_advance_updated_at();

-- ============================================================================
-- SEED DATA: ATLVS MASTER CATALOG
-- ============================================================================

-- Insert catalog categories
insert into catalog_categories (name, slug, icon, description, display_order, is_active) values
  ('Access', 'access', 'badge', 'Passes, credentials, and access control', 1, true),
  ('Production', 'production', 'mixer', 'DJ equipment, production gear, and stage equipment', 2, true),
  ('Technical', 'technical', 'speaker', 'Audio, lighting, and technical equipment', 3, true),
  ('Hospitality', 'hospitality', 'plate', 'Catering, green rooms, and hospitality services', 4, true),
  ('Travel', 'travel', 'plane', 'Transportation and travel arrangements', 5, true),
  ('Custom', 'custom', 'star', 'Custom requests and special services', 6, true)
on conflict (slug) do nothing;

-- Sample catalog items (Access category)
insert into catalog_items (
  category_id,
  name,
  slug,
  description,
  item_type,
  total_quantity,
  available_quantity,
  tags,
  is_active
)
select
  c.id,
  'Artist Access Pass',
  'artist-access-pass',
  'All-access pass for performing artists with backstage and VIP area access',
  'access',
  100,
  100,
  array['Access', 'VIP', 'Backstage'],
  true
from catalog_categories c where c.slug = 'access'
on conflict (slug) do nothing;

insert into catalog_items (
  category_id,
  name,
  slug,
  description,
  item_type,
  total_quantity,
  available_quantity,
  tags,
  is_active
)
select
  c.id,
  'Guest Pass',
  'guest-pass',
  'General guest pass for artist entourage and team members',
  'access',
  200,
  200,
  array['Access', 'Guest'],
  true
from catalog_categories c where c.slug = 'access'
on conflict (slug) do nothing;

-- Sample catalog items (Production category)
insert into catalog_items (
  category_id,
  name,
  slug,
  description,
  item_type,
  make,
  model,
  total_quantity,
  available_quantity,
  tags,
  is_active
)
select
  c.id,
  'DJ Mixer',
  'dj-mixer-djm-a9',
  'Professional 4-channel DJ mixer with advanced effects and connectivity',
  'equipment',
  'Pioneer',
  'DJM-A9',
  5,
  5,
  array['DJ', 'Audio', 'Mixer'],
  true
from catalog_categories c where c.slug = 'production'
on conflict (slug) do nothing;

insert into catalog_items (
  category_id,
  name,
  slug,
  description,
  item_type,
  make,
  model,
  total_quantity,
  available_quantity,
  tags,
  is_active
)
select
  c.id,
  'CDJ Player',
  'cdj-player-cdj-3000',
  'Professional multi-player with high-resolution audio support',
  'equipment',
  'Pioneer',
  'CDJ-3000',
  10,
  10,
  array['DJ', 'Audio', 'Player'],
  true
from catalog_categories c where c.slug = 'production'
on conflict (slug) do nothing;

-- Sample catalog items (Hospitality category)
insert into catalog_items (
  category_id,
  name,
  slug,
  description,
  item_type,
  total_quantity,
  available_quantity,
  tags,
  is_active
)
select
  c.id,
  'Green Room',
  'green-room-standard',
  'Private green room with seating, refreshments, and amenities',
  'service',
  10,
  10,
  array['Hospitality', 'Green Room'],
  true
from catalog_categories c where c.slug = 'hospitality'
on conflict (slug) do nothing;

-- Sample catalog items (Travel category)
insert into catalog_items (
  category_id,
  name,
  slug,
  description,
  item_type,
  total_quantity,
  available_quantity,
  tags,
  is_active
)
select
  c.id,
  'Golf Cart',
  'golf-cart-standard',
  'Electric golf cart for on-site transportation',
  'service',
  15,
  15,
  array['Travel', 'Transportation'],
  true
from catalog_categories c where c.slug = 'travel'
on conflict (slug) do nothing;

-- Add some modifiers for DJ Mixer
insert into catalog_item_modifiers (item_id, name, description, modifier_type, is_required, display_order)
select
  ci.id,
  'Extra Cables',
  'Additional XLR and RCA cables',
  'addon',
  false,
  1
from catalog_items ci where ci.slug = 'dj-mixer-djm-a9'
on conflict do nothing;

insert into catalog_item_modifiers (item_id, name, description, modifier_type, is_required, display_order)
select
  ci.id,
  'Setup Service',
  'Professional setup and sound check',
  'addon',
  false,
  2
from catalog_items ci where ci.slug = 'dj-mixer-djm-a9'
on conflict do nothing;
