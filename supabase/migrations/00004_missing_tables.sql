-- Missing tables and columns from requirements
-- Date: January 7, 2025

-- Note: content_posts, media_gallery, user_event_schedules, and brand_integrations
-- are already created in 00001_initial_schema.sql
-- Adding missing columns to existing tables

-- Add missing columns to content_posts
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS view_count integer default 0;

-- Add missing columns to media_gallery  
ALTER TABLE media_gallery ADD COLUMN IF NOT EXISTS brand_id uuid references brands(id) on delete cascade;
ALTER TABLE media_gallery ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE media_gallery ADD COLUMN IF NOT EXISTS view_count integer default 0;

-- Add missing columns to user_event_schedules
ALTER TABLE user_event_schedules ADD COLUMN IF NOT EXISTS share_token text unique;

-- Add missing columns to brand_integrations
ALTER TABLE brand_integrations ADD COLUMN IF NOT EXISTS error_message text;

-- User connections (friend system)
create table if not exists user_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  connected_user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'pending', -- pending, accepted, blocked
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, connected_user_id),
  check (user_id != connected_user_id)
);

-- User messages (direct messaging)
create table if not exists user_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete cascade,
  message text not null,
  read boolean default false,
  read_at timestamptz,
  metadata jsonb,
  created_at timestamptz default now(),
  check (sender_id != recipient_id)
);

-- Event chat rooms (community chat)
create table if not exists event_chat_rooms (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  name text not null,
  description text,
  room_type text not null default 'public', -- public, private, stage
  stage_id uuid references event_stages(id),
  max_participants integer,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Event chat messages
create table if not exists event_chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references event_chat_rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  message text not null,
  message_type text default 'text', -- text, image, system
  metadata jsonb,
  created_at timestamptz default now()
);

-- User-generated content (photos, reviews)
create table if not exists user_content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_id uuid references events(id),
  artist_id uuid references artists(id),
  content_type text not null, -- photo, video, review, story
  content_url text,
  caption text,
  rating integer check (rating >= 1 and rating <= 5),
  approved boolean default false,
  flagged boolean default false,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Push notification subscriptions
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text not null,
  keys jsonb not null, -- {p256dh, auth}
  user_agent text,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

-- Email queue (for Resend)
create table if not exists email_queue (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  from_email text not null,
  subject text not null,
  html_content text not null,
  text_content text,
  template_id text,
  template_data jsonb,
  status text not null default 'pending', -- pending, sent, failed
  resend_id text,
  error_message text,
  attempts integer default 0,
  max_attempts integer default 3,
  scheduled_for timestamptz default now(),
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_content_posts_brand_id on content_posts(brand_id);
create index if not exists idx_content_posts_status on content_posts(status);
create index if not exists idx_content_posts_published_at on content_posts(published_at);
create index if not exists idx_content_posts_slug on content_posts(slug);

create index if not exists idx_media_gallery_brand_id on media_gallery(brand_id);
create index if not exists idx_media_gallery_event_id on media_gallery(event_id);
create index if not exists idx_media_gallery_media_type on media_gallery(media_type);

create index if not exists idx_user_event_schedules_user_id on user_event_schedules(user_id);
create index if not exists idx_user_event_schedules_event_id on user_event_schedules(event_id);

create index if not exists idx_brand_integrations_brand_id on brand_integrations(brand_id);
create index if not exists idx_brand_integrations_status on brand_integrations(status);

create index if not exists idx_user_connections_user_id on user_connections(user_id);
create index if not exists idx_user_connections_status on user_connections(status);

create index if not exists idx_user_messages_sender_id on user_messages(sender_id);
create index if not exists idx_user_messages_recipient_id on user_messages(recipient_id);
create index if not exists idx_user_messages_read on user_messages(read);
create index if not exists idx_user_messages_created_at on user_messages(created_at desc);

create index if not exists idx_event_chat_rooms_event_id on event_chat_rooms(event_id);
create index if not exists idx_event_chat_rooms_active on event_chat_rooms(active);

create index if not exists idx_event_chat_messages_room_id on event_chat_messages(room_id);
create index if not exists idx_event_chat_messages_created_at on event_chat_messages(created_at desc);

create index if not exists idx_user_content_user_id on user_content(user_id);
create index if not exists idx_user_content_event_id on user_content(event_id);
create index if not exists idx_user_content_approved on user_content(approved);

create index if not exists idx_push_subscriptions_user_id on push_subscriptions(user_id);

create index if not exists idx_email_queue_status on email_queue(status);
create index if not exists idx_email_queue_scheduled_for on email_queue(scheduled_for);

-- Full-text search indexes
create index if not exists idx_content_posts_search on content_posts using gin(to_tsvector('english', title || ' ' || coalesce(content, '') || ' ' || coalesce(excerpt, '')));
create index if not exists idx_media_gallery_search on media_gallery using gin(to_tsvector('english', title || ' ' || coalesce(description, '')));

-- Row Level Security (RLS) policies

-- Content posts
alter table content_posts enable row level security;

create policy "Content posts are viewable by everyone" on content_posts
  for select using (status = 'published' or auth.uid() = author_id);

create policy "Authors can insert their own posts" on content_posts
  for insert with check (auth.uid() = author_id);

create policy "Authors can update their own posts" on content_posts
  for update using (auth.uid() = author_id);

create policy "Authors can delete their own posts" on content_posts
  for delete using (auth.uid() = author_id);

-- Media gallery
alter table media_gallery enable row level security;

create policy "Media is viewable by everyone" on media_gallery
  for select using (true);

create policy "Authenticated users can upload media" on media_gallery
  for insert with check (auth.uid() = uploaded_by);

create policy "Uploaders can update their media" on media_gallery
  for update using (auth.uid() = uploaded_by);

create policy "Uploaders can delete their media" on media_gallery
  for delete using (auth.uid() = uploaded_by);

-- User event schedules
alter table user_event_schedules enable row level security;

create policy "Users can view their own schedules" on user_event_schedules
  for select using (auth.uid() = user_id or shared = true);

create policy "Users can create their own schedules" on user_event_schedules
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own schedules" on user_event_schedules
  for update using (auth.uid() = user_id);

create policy "Users can delete their own schedules" on user_event_schedules
  for delete using (auth.uid() = user_id);

-- Brand integrations (admin only)
alter table brand_integrations enable row level security;

create policy "Brand admins can view integrations" on brand_integrations
  for select using (
    exists (
      select 1 from brand_admins
      where brand_admins.brand_id = brand_integrations.brand_id
      and brand_admins.user_id = auth.uid()
    )
  );

create policy "Brand admins can manage integrations" on brand_integrations
  for all using (
    exists (
      select 1 from brand_admins
      where brand_admins.brand_id = brand_integrations.brand_id
      and brand_admins.user_id = auth.uid()
      and brand_admins.role in ('owner', 'admin')
    )
  );

-- User connections
alter table user_connections enable row level security;

create policy "Users can view their connections" on user_connections
  for select using (auth.uid() = user_id or auth.uid() = connected_user_id);

create policy "Users can create connections" on user_connections
  for insert with check (auth.uid() = user_id);

create policy "Users can update their connections" on user_connections
  for update using (auth.uid() = user_id or auth.uid() = connected_user_id);

create policy "Users can delete their connections" on user_connections
  for delete using (auth.uid() = user_id);

-- User messages
alter table user_messages enable row level security;

create policy "Users can view their messages" on user_messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users can send messages" on user_messages
  for insert with check (auth.uid() = sender_id);

create policy "Recipients can update message read status" on user_messages
  for update using (auth.uid() = recipient_id);

-- Event chat rooms
alter table event_chat_rooms enable row level security;

create policy "Chat rooms are viewable by everyone" on event_chat_rooms
  for select using (active = true);

-- Event chat messages
alter table event_chat_messages enable row level security;

create policy "Chat messages are viewable by everyone" on event_chat_messages
  for select using (
    exists (
      select 1 from event_chat_rooms
      where event_chat_rooms.id = event_chat_messages.room_id
      and event_chat_rooms.active = true
    )
  );

create policy "Authenticated users can send chat messages" on event_chat_messages
  for insert with check (auth.uid() = user_id);

-- User content
alter table user_content enable row level security;

create policy "Approved content is viewable by everyone" on user_content
  for select using (approved = true or auth.uid() = user_id);

create policy "Users can create content" on user_content
  for insert with check (auth.uid() = user_id);

create policy "Users can update their content" on user_content
  for update using (auth.uid() = user_id);

create policy "Users can delete their content" on user_content
  for delete using (auth.uid() = user_id);

-- Push subscriptions
alter table push_subscriptions enable row level security;

create policy "Users can manage their push subscriptions" on push_subscriptions
  for all using (auth.uid() = user_id);

-- Email queue (service role only)
alter table email_queue enable row level security;

-- No public policies - service role only

-- Functions

-- Function to get unread message count
create or replace function get_unread_message_count(p_user_id uuid)
returns integer
language plpgsql
security definer
as $$
begin
  return (
    select count(*)
    from user_messages
    where recipient_id = p_user_id
    and read = false
  );
end;
$$;

-- Function to mark messages as read
create or replace function mark_messages_read(p_user_id uuid, p_sender_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update user_messages
  set read = true, read_at = now()
  where recipient_id = p_user_id
  and sender_id = p_sender_id
  and read = false;
end;
$$;

-- Function to process email queue
create or replace function process_email_queue()
returns table(
  id uuid,
  to_email text,
  from_email text,
  subject text,
  html_content text,
  text_content text
)
language plpgsql
security definer
as $$
begin
  return query
  update email_queue
  set status = 'processing',
      attempts = attempts + 1
  where email_queue.id in (
    select email_queue.id
    from email_queue
    where status = 'pending'
    and scheduled_for <= now()
    and attempts < max_attempts
    order by scheduled_for
    limit 10
  )
  returning 
    email_queue.id,
    email_queue.to_email,
    email_queue.from_email,
    email_queue.subject,
    email_queue.html_content,
    email_queue.text_content;
end;
$$;

-- Triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

DROP TRIGGER IF EXISTS update_content_posts_updated_at ON content_posts;
CREATE TRIGGER update_content_posts_updated_at BEFORE UPDATE ON content_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_gallery_updated_at ON media_gallery;
CREATE TRIGGER update_media_gallery_updated_at BEFORE UPDATE ON media_gallery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_event_schedules_updated_at ON user_event_schedules;
CREATE TRIGGER update_user_event_schedules_updated_at BEFORE UPDATE ON user_event_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brand_integrations_updated_at ON brand_integrations;
CREATE TRIGGER update_brand_integrations_updated_at BEFORE UPDATE ON brand_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_connections_updated_at ON user_connections;
CREATE TRIGGER update_user_connections_updated_at BEFORE UPDATE ON user_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_chat_rooms_updated_at ON event_chat_rooms;
CREATE TRIGGER update_event_chat_rooms_updated_at BEFORE UPDATE ON event_chat_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_content_updated_at ON user_content;
CREATE TRIGGER update_user_content_updated_at BEFORE UPDATE ON user_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
