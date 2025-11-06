-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Brands table (multi-tenancy support)
create table brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  domain text unique,
  logo_url text,
  favicon_url text,
  brand_colors jsonb,
  typography jsonb,
  tagline text,
  description text,
  social_links jsonb,
  contact_email text,
  settings jsonb,
  stripe_account_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Brand administrators
create table brand_admins (
  brand_id uuid references brands(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null, -- owner, admin, editor, viewer
  created_at timestamptz default now(),
  primary key (brand_id, user_id)
);

-- Events table
create table events (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id),
  name text not null,
  slug text unique not null,
  description text,
  event_type text, -- festival, concert, club_night, etc.
  start_date timestamptz not null,
  end_date timestamptz,
  venue_name text,
  venue_address jsonb,
  venue_coordinates point,
  age_restriction text, -- 18+, 21+, All Ages
  capacity integer,
  status text default 'upcoming', -- upcoming, on_sale, sold_out, past
  hero_image_url text,
  hero_video_url text,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Event stages
create table event_stages (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  name text not null,
  description text,
  stage_type text, -- main, secondary, underground, etc.
  capacity integer,
  created_at timestamptz default now()
);

-- Artists table
create table artists (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  bio text,
  genre_tags text[],
  profile_image_url text,
  cover_image_url text,
  social_links jsonb,
  booking_email text,
  website_url text,
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Event schedule/set times
create table event_schedule (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  stage_id uuid references event_stages(id),
  artist_id uuid references artists(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  special_notes text,
  created_at timestamptz default now()
);

-- Artist to Event relationship
create table event_artists (
  event_id uuid references events(id) on delete cascade,
  artist_id uuid references artists(id) on delete cascade,
  performance_order integer,
  headliner boolean default false,
  primary key (event_id, artist_id)
);

-- Ticket types
create table ticket_types (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  name text not null,
  description text,
  price decimal(10,2) not null,
  quantity_available integer,
  quantity_sold integer default 0,
  sale_start_date timestamptz,
  sale_end_date timestamptz,
  max_per_order integer,
  stripe_price_id text,
  perks jsonb,
  created_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  event_id uuid references events(id),
  stripe_payment_intent_id text unique,
  stripe_customer_id text,
  total_amount decimal(10,2) not null,
  status text default 'pending', -- pending, completed, cancelled, refunded
  order_items jsonb,
  billing_details jsonb,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tickets (individual tickets from orders)
create table tickets (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id),
  ticket_type_id uuid references ticket_types(id),
  attendee_name text,
  attendee_email text,
  qr_code text unique,
  status text default 'active', -- active, used, transferred, cancelled
  scanned_at timestamptz,
  transferred_to_user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Products (merchandise)
create table products (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id),
  event_id uuid references events(id),
  name text not null,
  slug text unique not null,
  description text,
  category text, -- apparel, accessories, collectibles, etc.
  base_price decimal(10,2) not null,
  images text[],
  stripe_product_id text,
  status text default 'active', -- active, draft, archived
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Product variants
create table product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  name text,
  sku text unique,
  price decimal(10,2),
  stock_quantity integer,
  stripe_price_id text,
  variant_attributes jsonb,
  created_at timestamptz default now()
);

-- Content posts (blog/news)
create table content_posts (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id),
  title text not null,
  slug text unique not null,
  content text,
  excerpt text,
  author_id uuid references auth.users(id),
  post_type text default 'article', -- article, news, press_release, guide
  featured_image_url text,
  tags text[],
  related_event_id uuid references events(id),
  related_artist_ids uuid[],
  published_at timestamptz,
  status text default 'draft', -- draft, published, archived
  seo_metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Media gallery
create table media_gallery (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  media_type text not null, -- photo, video, album
  media_url text not null,
  thumbnail_url text,
  event_id uuid references events(id),
  artist_ids uuid[],
  tags text[],
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- User profiles
create table user_profiles (
  id uuid primary key references auth.users(id),
  username text unique,
  display_name text,
  bio text,
  avatar_url text,
  favorite_genres text[],
  notification_preferences jsonb,
  loyalty_points integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User favorite artists
create table user_favorite_artists (
  user_id uuid references auth.users(id) on delete cascade,
  artist_id uuid references artists(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, artist_id)
);

-- User event schedules
create table user_event_schedules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  schedule_items jsonb,
  shared boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Brand integrations
create table brand_integrations (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id) on delete cascade,
  integration_type text not null,
  config jsonb not null,
  status text default 'active', -- active, inactive, error
  last_sync_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for performance
create index idx_events_brand_id on events(brand_id);
create index idx_events_slug on events(slug);
create index idx_events_status on events(status);
create index idx_events_start_date on events(start_date);
create index idx_artists_slug on artists(slug);
create index idx_ticket_types_event_id on ticket_types(event_id);
create index idx_orders_user_id on orders(user_id);
create index idx_orders_event_id on orders(event_id);
create index idx_tickets_order_id on tickets(order_id);
create index idx_tickets_qr_code on tickets(qr_code);
create index idx_products_brand_id on products(brand_id);
create index idx_products_slug on products(slug);
create index idx_content_posts_brand_id on content_posts(brand_id);
create index idx_content_posts_slug on content_posts(slug);

-- Enable Row Level Security
alter table brands enable row level security;
alter table brand_admins enable row level security;
alter table events enable row level security;
alter table event_stages enable row level security;
alter table artists enable row level security;
alter table event_schedule enable row level security;
alter table event_artists enable row level security;
alter table ticket_types enable row level security;
alter table orders enable row level security;
alter table tickets enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table content_posts enable row level security;
alter table media_gallery enable row level security;
alter table user_profiles enable row level security;
alter table user_favorite_artists enable row level security;
alter table user_event_schedules enable row level security;
alter table brand_integrations enable row level security;

-- RLS Policies for public read access
create policy "Public can view published events"
  on events for select
  using (status in ('upcoming', 'on_sale', 'sold_out'));

create policy "Public can view artists"
  on artists for select
  using (true);

create policy "Public can view ticket types"
  on ticket_types for select
  using (true);

create policy "Public can view products"
  on products for select
  using (status = 'active');

create policy "Public can view published content"
  on content_posts for select
  using (status = 'published');

-- RLS Policies for authenticated users
create policy "Users can view their own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users can view their own tickets"
  on tickets for select
  using (
    order_id in (
      select id from orders where user_id = auth.uid()
    )
  );

create policy "Users can manage their own profile"
  on user_profiles for all
  using (auth.uid() = id);

create policy "Users can manage their favorite artists"
  on user_favorite_artists for all
  using (auth.uid() = user_id);

create policy "Users can manage their event schedules"
  on user_event_schedules for all
  using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_brands_updated_at before update on brands
  for each row execute function update_updated_at_column();

create trigger update_events_updated_at before update on events
  for each row execute function update_updated_at_column();

create trigger update_artists_updated_at before update on artists
  for each row execute function update_updated_at_column();

create trigger update_orders_updated_at before update on orders
  for each row execute function update_updated_at_column();

create trigger update_products_updated_at before update on products
  for each row execute function update_updated_at_column();

create trigger update_content_posts_updated_at before update on content_posts
  for each row execute function update_updated_at_column();

create trigger update_user_profiles_updated_at before update on user_profiles
  for each row execute function update_updated_at_column();
