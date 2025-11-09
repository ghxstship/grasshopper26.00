-- Authentication Enhancements Migration
-- Adds MFA support, account lockout, and enhanced RBAC

-- ============================================================================
-- 1. MFA (Multi-Factor Authentication) Support
-- ============================================================================

-- Table to store MFA factors for users
create table if not exists user_mfa_factors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  factor_type text not null check (factor_type in ('totp', 'sms')),
  secret text, -- Encrypted TOTP secret
  phone_number text, -- For SMS MFA
  backup_codes text[], -- Encrypted backup codes
  is_verified boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, factor_type)
);

-- Index for quick lookups
create index idx_user_mfa_factors_user_id on user_mfa_factors(user_id);

-- RLS policies for MFA factors
alter table user_mfa_factors enable row level security;

create policy "Users can view their own MFA factors"
  on user_mfa_factors for select
  using (auth.uid() = user_id);

create policy "Users can manage their own MFA factors"
  on user_mfa_factors for all
  using (auth.uid() = user_id);

-- ============================================================================
-- 2. Account Lockout & Brute Force Protection
-- ============================================================================

-- Table to track login attempts
create table if not exists login_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  ip_address inet,
  user_agent text,
  success boolean not null,
  failure_reason text,
  attempted_at timestamptz default now()
);

-- Index for quick lookups
create index idx_login_attempts_email on login_attempts(email);
create index idx_login_attempts_user_id on login_attempts(user_id);
create index idx_login_attempts_ip on login_attempts(ip_address);
create index idx_login_attempts_attempted_at on login_attempts(attempted_at);

-- Table to track account lockouts
create table if not exists account_lockouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  email text not null,
  locked_at timestamptz default now(),
  locked_until timestamptz not null,
  lock_reason text default 'too_many_failed_attempts',
  failed_attempts integer default 0,
  is_locked boolean default true,
  unlocked_at timestamptz,
  unlocked_by uuid references auth.users(id)
);

-- Index for quick lookups
create index idx_account_lockouts_user_id on account_lockouts(user_id);
create index idx_account_lockouts_email on account_lockouts(email);

-- ============================================================================
-- 3. Enhanced RBAC - Add role column first
-- ============================================================================

-- Add role column to user_profiles if not exists (moved before RLS policies)
do $$ 
begin
  if not exists (select 1 from information_schema.columns 
                 where table_name = 'user_profiles' and column_name = 'role') then
    alter table user_profiles add column role text default 'user' 
      check (role in ('super_admin', 'brand_admin', 'event_manager', 'user', 'guest'));
  end if;
end $$;

-- RLS policies for login attempts (admin only)
alter table login_attempts enable row level security;

create policy "Admins can view all login attempts"
  on login_attempts for select
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- RLS policies for account lockouts
alter table account_lockouts enable row level security;

create policy "Users can view their own lockout status"
  on account_lockouts for select
  using (auth.uid() = user_id);

create policy "Admins can manage lockouts"
  on account_lockouts for all
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- ============================================================================
-- 4. Fine-Grained Permissions Tables
-- ============================================================================

-- Permissions table for fine-grained access control
create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  resource text not null, -- events, products, orders, etc.
  action text not null, -- create, read, update, delete, manage
  created_at timestamptz default now()
);

-- Role permissions mapping
create table if not exists role_permissions (
  role text not null,
  permission_id uuid references permissions(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (role, permission_id)
);

-- User-specific permission overrides
create table if not exists user_permissions (
  user_id uuid references auth.users(id) on delete cascade,
  permission_id uuid references permissions(id) on delete cascade,
  granted boolean default true, -- true = grant, false = revoke
  granted_by uuid references auth.users(id),
  created_at timestamptz default now(),
  primary key (user_id, permission_id)
);

-- RLS policies for permissions
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table user_permissions enable row level security;

create policy "Anyone can view permissions"
  on permissions for select
  using (true);

create policy "Admins can manage permissions"
  on permissions for all
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

create policy "Admins can manage role permissions"
  on role_permissions for all
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

create policy "Admins can manage user permissions"
  on user_permissions for all
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- ============================================================================
-- 5. Helper Functions
-- ============================================================================

-- Function to check if account is locked
create or replace function is_account_locked(p_user_id uuid)
returns boolean as $$
declare
  v_locked boolean;
begin
  select is_locked into v_locked
  from account_lockouts
  where user_id = p_user_id
    and is_locked = true
    and locked_until > now();
  
  return coalesce(v_locked, false);
end;
$$ language plpgsql security definer;

-- Function to record login attempt
create or replace function record_login_attempt(
  p_user_id uuid,
  p_email text,
  p_ip_address inet,
  p_user_agent text,
  p_success boolean,
  p_failure_reason text default null
)
returns void as $$
declare
  v_failed_attempts integer;
  v_lockout_threshold integer := 5;
  v_lockout_duration interval := '30 minutes';
begin
  -- Insert login attempt
  insert into login_attempts (user_id, email, ip_address, user_agent, success, failure_reason)
  values (p_user_id, p_email, p_ip_address, p_user_agent, p_success, p_failure_reason);
  
  -- If failed, check if we need to lock the account
  if not p_success and p_user_id is not null then
    -- Count recent failed attempts (last 15 minutes)
    select count(*) into v_failed_attempts
    from login_attempts
    where user_id = p_user_id
      and success = false
      and attempted_at > now() - interval '15 minutes';
    
    -- Lock account if threshold exceeded
    if v_failed_attempts >= v_lockout_threshold then
      insert into account_lockouts (user_id, email, locked_until, failed_attempts)
      values (p_user_id, p_email, now() + v_lockout_duration, v_failed_attempts)
      on conflict (user_id) do update
      set locked_at = now(),
          locked_until = now() + v_lockout_duration,
          failed_attempts = v_failed_attempts,
          is_locked = true;
    end if;
  end if;
end;
$$ language plpgsql security definer;

-- Function to unlock account
create or replace function unlock_account(p_user_id uuid, p_unlocked_by uuid)
returns void as $$
begin
  update account_lockouts
  set is_locked = false,
      unlocked_at = now(),
      unlocked_by = p_unlocked_by
  where user_id = p_user_id;
end;
$$ language plpgsql security definer;

-- Function to check user permission
create or replace function has_permission(
  p_user_id uuid,
  p_resource text,
  p_action text
)
returns boolean as $$
declare
  v_has_permission boolean;
  v_user_role text;
begin
  -- Get user role
  select role into v_user_role
  from user_profiles
  where id = p_user_id;
  
  -- Super admin has all permissions
  if v_user_role = 'super_admin' then
    return true;
  end if;
  
  -- Check user-specific permission overrides first
  select granted into v_has_permission
  from user_permissions up
  join permissions p on up.permission_id = p.id
  where up.user_id = p_user_id
    and p.resource = p_resource
    and p.action = p_action;
  
  if v_has_permission is not null then
    return v_has_permission;
  end if;
  
  -- Check role-based permissions
  select exists(
    select 1
    from role_permissions rp
    join permissions p on rp.permission_id = p.id
    where rp.role = v_user_role
      and p.resource = p_resource
      and p.action = p_action
  ) into v_has_permission;
  
  return coalesce(v_has_permission, false);
end;
$$ language plpgsql security definer;

-- ============================================================================
-- 6. Insert Default Permissions
-- ============================================================================

-- Insert default permissions
insert into permissions (name, resource, action, description) values
  -- Event permissions
  ('events.create', 'events', 'create', 'Create new events'),
  ('events.read', 'events', 'read', 'View events'),
  ('events.update', 'events', 'update', 'Update events'),
  ('events.delete', 'events', 'delete', 'Delete events'),
  ('events.manage', 'events', 'manage', 'Full event management'),
  
  -- Product permissions
  ('products.create', 'products', 'create', 'Create new products'),
  ('products.read', 'products', 'read', 'View products'),
  ('products.update', 'products', 'update', 'Update products'),
  ('products.delete', 'products', 'delete', 'Delete products'),
  ('products.manage', 'products', 'manage', 'Full product management'),
  
  -- Order permissions
  ('orders.read', 'orders', 'read', 'View orders'),
  ('orders.update', 'orders', 'update', 'Update orders'),
  ('orders.refund', 'orders', 'refund', 'Process refunds'),
  ('orders.manage', 'orders', 'manage', 'Full order management'),
  
  -- User permissions
  ('users.read', 'users', 'read', 'View users'),
  ('users.update', 'users', 'update', 'Update users'),
  ('users.delete', 'users', 'delete', 'Delete users'),
  ('users.manage', 'users', 'manage', 'Full user management'),
  
  -- Brand permissions
  ('brands.create', 'brands', 'create', 'Create brands'),
  ('brands.read', 'brands', 'read', 'View brands'),
  ('brands.update', 'brands', 'update', 'Update brands'),
  ('brands.delete', 'brands', 'delete', 'Delete brands'),
  ('brands.manage', 'brands', 'manage', 'Full brand management')
on conflict (name) do nothing;

-- Assign permissions to roles
insert into role_permissions (role, permission_id)
select 'super_admin', id from permissions
on conflict do nothing;

insert into role_permissions (role, permission_id)
select 'brand_admin', id from permissions 
where resource in ('events', 'products', 'orders', 'brands') and action != 'delete'
on conflict do nothing;

insert into role_permissions (role, permission_id)
select 'event_manager', id from permissions 
where resource in ('events', 'orders') and action in ('read', 'update')
on conflict do nothing;

insert into role_permissions (role, permission_id)
select 'user', id from permissions 
where action = 'read'
on conflict do nothing;

-- ============================================================================
-- 7. Triggers
-- ============================================================================

-- Trigger to update updated_at on user_mfa_factors
create trigger update_user_mfa_factors_updated_at 
  before update on user_mfa_factors
  for each row execute function update_updated_at_column();

-- ============================================================================
-- 8. Comments
-- ============================================================================

comment on table user_mfa_factors is 'Stores MFA configuration for users';
comment on table login_attempts is 'Tracks all login attempts for security monitoring';
comment on table account_lockouts is 'Manages account lockouts due to failed login attempts';
comment on table permissions is 'Defines available permissions in the system';
comment on table role_permissions is 'Maps permissions to roles';
comment on table user_permissions is 'User-specific permission overrides';
