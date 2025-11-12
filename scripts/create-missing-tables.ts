/**
 * Create missing tables for Florida seeding
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdventuresTable() {
  console.log('Creating adventures table...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Adventures table
      CREATE TABLE IF NOT EXISTS adventures (
        id uuid primary key default gen_random_uuid(),
        name text not null,
        slug text unique not null,
        description text,
        adventure_type text,
        location_name text not null,
        location_address jsonb,
        location_coordinates point not null,
        city text not null,
        state text not null default 'FL',
        price_range text,
        min_price decimal(10,2),
        max_price decimal(10,2),
        duration_hours decimal(4,1),
        difficulty_level text,
        age_restriction text,
        max_participants integer,
        hero_image_url text,
        gallery_images text[],
        amenities text[],
        tags text[],
        booking_url text,
        contact_email text,
        contact_phone text,
        website_url text,
        social_links jsonb,
        operating_hours jsonb,
        seasonal_availability jsonb,
        status text default 'active',
        featured boolean default false,
        rating decimal(2,1),
        review_count integer default 0,
        metadata jsonb,
        created_at timestamptz default now(),
        updated_at timestamptz default now()
      );

      CREATE INDEX IF NOT EXISTS adventures_city_idx ON adventures(city);
      CREATE INDEX IF NOT EXISTS adventures_status_idx ON adventures(status);
    `
  });

  if (error) console.error('Error:', error);
  else console.log('✓ Adventures table created');
}

async function createNewsTable() {
  console.log('Creating news_articles table...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS news_articles (
        id uuid primary key default gen_random_uuid(),
        title text not null,
        slug text unique not null,
        excerpt text,
        content text,
        image_url text,
        category text,
        author text,
        published boolean default false,
        published_at timestamptz,
        created_at timestamptz default now(),
        updated_at timestamptz default now()
      );

      CREATE INDEX IF NOT EXISTS news_published_idx ON news_articles(published);
    `
  });

  if (error) console.error('Error:', error);
  else console.log('✓ News articles table created');
}

async function updateProductsTable() {
  console.log('Updating products table...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url text;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS category text;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS price text;
    `
  });

  if (error) console.error('Error:', error);
  else console.log('✓ Products table updated');
}

async function main() {
  console.log('🔧 Creating missing tables...\n');
  
  await createAdventuresTable();
  await createNewsTable();
  await updateProductsTable();
  
  console.log('\n✅ Tables created! Run: npm run seed:florida');
}

main().catch(console.error);
