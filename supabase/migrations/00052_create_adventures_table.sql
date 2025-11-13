-- Adventures table for location-based experiences
create table adventures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  adventure_type text, -- hiking, kayaking, tours, experiences, etc.
  location_name text not null,
  location_address jsonb,
  location_coordinates point not null, -- Required for geolocation radius search
  city text not null,
  state text not null default 'FL',
  price_range text, -- $, $$, $$$, $$$$
  min_price decimal(10,2),
  max_price decimal(10,2),
  duration_hours decimal(4,1),
  difficulty_level text, -- easy, moderate, challenging, expert
  age_restriction text, -- All Ages, 18+, 21+
  max_participants integer,
  hero_image_url text,
  gallery_images text[],
  amenities text[], -- parking, restrooms, food, equipment_rental, etc.
  tags text[], -- outdoor, water, adventure, family-friendly, etc.
  booking_url text,
  contact_email text,
  contact_phone text,
  website_url text,
  social_links jsonb,
  operating_hours jsonb, -- {monday: {open: "09:00", close: "17:00"}, ...}
  seasonal_availability jsonb, -- {start_month: 3, end_month: 11}
  status text default 'active', -- active, inactive, seasonal
  featured boolean default false,
  rating decimal(2,1), -- Average rating 0.0-5.0
  review_count integer default 0,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for geolocation and filtering
create index adventures_location_idx on adventures using gist(location_coordinates);
create index adventures_city_idx on adventures(city);
create index adventures_state_idx on adventures(state);
create index adventures_type_idx on adventures(adventure_type);
create index adventures_status_idx on adventures(status);
create index adventures_featured_idx on adventures(featured) where featured = true;
create index adventures_tags_idx on adventures using gin(tags);

-- Create function to search adventures by radius (in miles)
create or replace function search_adventures_by_radius(
  lat double precision,
  lng double precision,
  radius_miles double precision default 50
)
returns table (
  id uuid,
  name text,
  slug text,
  description text,
  adventure_type text,
  location_name text,
  city text,
  state text,
  price_range text,
  min_price decimal,
  max_price decimal,
  hero_image_url text,
  distance_miles double precision
) as $$
begin
  return query
  select
    a.id,
    a.name,
    a.slug,
    a.description,
    a.adventure_type,
    a.location_name,
    a.city,
    a.state,
    a.price_range,
    a.min_price,
    a.max_price,
    a.hero_image_url,
    -- Calculate distance in miles using Haversine formula
    (
      3959 * acos(
        cos(radians(lat)) * 
        cos(radians(a.location_coordinates[1])) * 
        cos(radians(a.location_coordinates[0]) - radians(lng)) + 
        sin(radians(lat)) * 
        sin(radians(a.location_coordinates[1]))
      )
    ) as distance_miles
  from adventures a
  where a.status = 'active'
    and (
      3959 * acos(
        cos(radians(lat)) * 
        cos(radians(a.location_coordinates[1])) * 
        cos(radians(a.location_coordinates[0]) - radians(lng)) + 
        sin(radians(lat)) * 
        sin(radians(a.location_coordinates[1]))
      )
    ) <= radius_miles
  order by distance_miles;
end;
$$ language plpgsql stable;

-- RLS Policies
alter table adventures enable row level security;

-- Public read access for active adventures
create policy "Adventures are viewable by everyone"
  on adventures for select
  using (status = 'active');

-- Admin write access (check if role column exists first)
do $$
begin
  if exists (
    select 1 from information_schema.columns 
    where table_name = 'user_profiles' and column_name = 'role'
  ) then
    execute 'create policy "Admins can manage adventures"
      on adventures for all
      using (
        exists (
          select 1 from user_profiles
          where id = auth.uid()
          and role in (''super_admin'', ''brand_admin'', ''event_manager'')
        )
      )';
  else
    -- Fallback: only authenticated users can manage
    execute 'create policy "Admins can manage adventures"
      on adventures for all
      using (auth.uid() is not null)';
  end if;
end $$;

-- Updated at trigger
create trigger update_adventures_updated_at
  before update on adventures
  for each row
  execute function update_updated_at_column();
