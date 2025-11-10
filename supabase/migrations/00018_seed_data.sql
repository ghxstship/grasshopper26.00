-- Comprehensive seed data for development and testing

-- Insert default brand
INSERT INTO brands (id, name, slug, domain, tagline, description, brand_colors, settings)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Grasshopper Entertainment',
  'grasshopper',
  'grasshopper.local',
  'Experience Live Music Like Never Before',
  'The premier platform for discovering and experiencing live entertainment events.',
  '{"primary": "#6366f1", "secondary": "#8b5cf6", "accent": "#ec4899", "background": "#0f172a", "foreground": "#f8fafc"}'::jsonb,
  '{"currency": "USD", "timezone": "America/New_York", "features": {"merchandise": true, "loyalty": true, "waitlist": true}}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert sample artists
INSERT INTO artists (id, name, slug, bio, genre_tags, verified, profile_image_url)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'The Electric Collective',
    'the-electric-collective',
    'An innovative electronic music group pushing the boundaries of sound and visual art.',
    ARRAY['Electronic', 'House', 'Techno'],
    true,
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop&q=80'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Luna & The Moonbeams',
    'luna-and-the-moonbeams',
    'Indie rock band known for their ethereal soundscapes and powerful live performances.',
    ARRAY['Indie Rock', 'Alternative', 'Dream Pop'],
    true,
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=800&fit=crop&q=80'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'DJ Nexus',
    'dj-nexus',
    'World-renowned DJ and producer specializing in progressive house and trance.',
    ARRAY['EDM', 'Progressive House', 'Trance'],
    true,
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&h=800&fit=crop&q=80'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'The Midnight Riders',
    'the-midnight-riders',
    'Classic rock revival band bringing the spirit of the 70s to modern audiences.',
    ARRAY['Rock', 'Classic Rock', 'Blues Rock'],
    false,
    'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&h=800&fit=crop&q=80'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'Soulful Symphony',
    'soulful-symphony',
    'R&B and soul collective delivering smooth vocals and rich harmonies.',
    ARRAY['R&B', 'Soul', 'Neo-Soul'],
    true,
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=800&fit=crop&q=80'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample events
INSERT INTO events (id, brand_id, name, slug, description, event_type, start_date, end_date, venue_name, venue_address, capacity, status, hero_image_url)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Summer Sonic Festival 2025',
    'summer-sonic-festival-2025',
    'Three days of non-stop music featuring the biggest names in electronic and indie music. Experience multiple stages, art installations, and unforgettable performances.',
    'festival',
    '2025-07-15 12:00:00+00',
    '2025-07-17 23:59:00+00',
    'Riverside Park',
    '{"street": "123 Riverside Drive", "city": "Portland", "state": "OR", "zip": "97201", "country": "USA"}'::jsonb,
    50000,
    'on_sale',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=800&fit=crop&q=80'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Luna & The Moonbeams: Celestial Tour',
    'luna-moonbeams-celestial-tour',
    'An intimate evening with Luna & The Moonbeams performing songs from their latest album "Starlight Sessions".',
    'concert',
    '2025-06-20 20:00:00+00',
    '2025-06-20 23:00:00+00',
    'The Crystal Ballroom',
    '{"street": "1332 W Burnside St", "city": "Portland", "state": "OR", "zip": "97209", "country": "USA"}'::jsonb,
    1500,
    'on_sale',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&h=800&fit=crop&q=80'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Underground Saturdays: DJ Nexus',
    'underground-saturdays-dj-nexus',
    'Join us for an underground warehouse party featuring DJ Nexus spinning progressive house all night long.',
    'club_night',
    '2025-05-25 22:00:00+00',
    '2025-05-26 04:00:00+00',
    'The Warehouse',
    '{"street": "456 Industrial Ave", "city": "Portland", "state": "OR", "zip": "97202", "country": "USA"}'::jsonb,
    800,
    'on_sale',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=800&fit=crop&q=80'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Rock Revival Night',
    'rock-revival-night',
    'The Midnight Riders bring classic rock back to life with special guest performances.',
    'concert',
    '2025-08-10 19:00:00+00',
    '2025-08-10 22:30:00+00',
    'Revolution Hall',
    '{"street": "1300 SE Stark St", "city": "Portland", "state": "OR", "zip": "97214", "country": "USA"}'::jsonb,
    850,
    'upcoming',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&h=800&fit=crop&q=80'
  )
ON CONFLICT (id) DO NOTHING;

-- Link artists to events
INSERT INTO event_artists (event_id, artist_id, performance_order, headliner)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1, true),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 2, true),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 3, false),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 1, true),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 1, true),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 1, true),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 2, false)
ON CONFLICT (event_id, artist_id) DO NOTHING;

-- Insert ticket types
INSERT INTO ticket_types (id, event_id, name, description, price, quantity_available, sale_start_date, sale_end_date, max_per_order, perks)
VALUES
  -- Summer Sonic Festival tickets
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'General Admission - 3 Day Pass',
    'Full festival access for all three days',
    299.00,
    30000,
    '2025-03-01 00:00:00+00',
    '2025-07-15 12:00:00+00',
    10,
    '["Access to all stages", "Festival map and schedule", "Water refill stations"]'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'VIP - 3 Day Pass',
    'Premium festival experience with exclusive perks',
    599.00,
    5000,
    '2025-03-01 00:00:00+00',
    '2025-07-15 12:00:00+00',
    6,
    '["VIP viewing areas", "Exclusive lounge access", "Complimentary drinks", "Express entry", "Premium restrooms", "Meet & greet opportunities"]'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001',
    'Single Day Pass - Friday',
    'Access for Friday only',
    129.00,
    15000,
    '2025-03-01 00:00:00+00',
    '2025-07-15 12:00:00+00',
    8,
    '["Access to all stages", "Festival map"]'::jsonb
  ),
  -- Luna & The Moonbeams tickets
  (
    '30000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000002',
    'General Admission',
    'Standing room general admission',
    45.00,
    1000,
    '2025-04-01 00:00:00+00',
    '2025-06-20 20:00:00+00',
    6,
    '["General admission standing"]'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000002',
    'Reserved Seating',
    'Reserved seat with great view',
    75.00,
    500,
    '2025-04-01 00:00:00+00',
    '2025-06-20 20:00:00+00',
    4,
    '["Reserved seating", "Commemorative poster"]'::jsonb
  ),
  -- DJ Nexus tickets
  (
    '30000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000003',
    'Early Bird',
    'Limited early bird pricing',
    25.00,
    200,
    '2025-04-01 00:00:00+00',
    '2025-05-01 00:00:00+00',
    4,
    '["Early entry", "Coat check included"]'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000007',
    '20000000-0000-0000-0000-000000000003',
    'General Admission',
    'Standard entry',
    35.00,
    600,
    '2025-04-01 00:00:00+00',
    '2025-05-25 22:00:00+00',
    6,
    '["General admission"]'::jsonb
  ),
  -- Rock Revival Night tickets
  (
    '30000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000004',
    'General Admission',
    'Standing room general admission',
    40.00,
    700,
    '2025-05-01 00:00:00+00',
    '2025-08-10 19:00:00+00',
    8,
    '["General admission standing"]'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000009',
    '20000000-0000-0000-0000-000000000004',
    'Balcony Seating',
    'Reserved balcony seats',
    60.00,
    150,
    '2025-05-01 00:00:00+00',
    '2025-08-10 19:00:00+00',
    4,
    '["Reserved balcony seating", "Exclusive merchandise discount"]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample products (merchandise)
INSERT INTO products (id, brand_id, name, slug, description, category, base_price, images, status)
VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Summer Sonic Festival T-Shirt',
    'summer-sonic-festival-tshirt',
    'Official festival t-shirt with exclusive 2025 design',
    'apparel',
    35.00,
    ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&q=80'],
    'active'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Festival Hoodie',
    'festival-hoodie',
    'Comfortable hoodie perfect for cool festival nights',
    'apparel',
    65.00,
    ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop&q=80'],
    'active'
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Limited Edition Poster Set',
    'limited-edition-poster-set',
    'Set of 3 collectible posters featuring festival artists',
    'collectibles',
    45.00,
    ARRAY['https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=800&fit=crop&q=80'],
    'active'
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Festival Tote Bag',
    'festival-tote-bag',
    'Eco-friendly canvas tote bag',
    'accessories',
    25.00,
    ARRAY['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop&q=80'],
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert product variants
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, variant_attributes)
VALUES
  -- T-Shirt variants
  ('40000000-0000-0000-0000-000000000001', 'Small', 'SSF-TS-S', 35.00, 100, '{"size": "S", "color": "Black"}'::jsonb),
  ('40000000-0000-0000-0000-000000000001', 'Medium', 'SSF-TS-M', 35.00, 200, '{"size": "M", "color": "Black"}'::jsonb),
  ('40000000-0000-0000-0000-000000000001', 'Large', 'SSF-TS-L', 35.00, 200, '{"size": "L", "color": "Black"}'::jsonb),
  ('40000000-0000-0000-0000-000000000001', 'X-Large', 'SSF-TS-XL', 35.00, 150, '{"size": "XL", "color": "Black"}'::jsonb),
  
  -- Hoodie variants
  ('40000000-0000-0000-0000-000000000002', 'Small', 'FH-S', 65.00, 50, '{"size": "S", "color": "Navy"}'::jsonb),
  ('40000000-0000-0000-0000-000000000002', 'Medium', 'FH-M', 65.00, 100, '{"size": "M", "color": "Navy"}'::jsonb),
  ('40000000-0000-0000-0000-000000000002', 'Large', 'FH-L', 65.00, 100, '{"size": "L", "color": "Navy"}'::jsonb),
  ('40000000-0000-0000-0000-000000000002', 'X-Large', 'FH-XL', 65.00, 75, '{"size": "XL", "color": "Navy"}'::jsonb),
  
  -- Poster set (one size)
  ('40000000-0000-0000-0000-000000000003', 'Standard', 'PS-STD', 45.00, 500, '{"size": "18x24"}'::jsonb),
  
  -- Tote bag (one size)
  ('40000000-0000-0000-0000-000000000004', 'One Size', 'TB-OS', 25.00, 300, '{"color": "Natural"}'::jsonb)
ON CONFLICT (sku) DO NOTHING;

-- Insert sample content posts
INSERT INTO content_posts (id, brand_id, title, slug, content, excerpt, post_type, featured_image_url, tags, status, published_at)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Announcing Summer Sonic Festival 2025 Lineup',
    'announcing-summer-sonic-festival-2025-lineup',
    'We are thrilled to announce the full lineup for Summer Sonic Festival 2025! This year''s festival will feature over 100 artists across 5 stages...',
    'The wait is over! Check out the incredible lineup for Summer Sonic Festival 2025.',
    'news',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=800&fit=crop&q=80',
    ARRAY['festival', 'lineup', 'announcement'],
    'published',
    NOW() - INTERVAL '7 days'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Festival Survival Guide: Tips for First-Timers',
    'festival-survival-guide-tips-for-first-timers',
    'Heading to your first music festival? Here are our top tips to make the most of your experience...',
    'Everything you need to know for your first festival experience.',
    'guide',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&h=800&fit=crop&q=80',
    ARRAY['festival', 'guide', 'tips'],
    'published',
    NOW() - INTERVAL '14 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert loyalty rewards
INSERT INTO loyalty_rewards (id, brand_id, name, description, points_required, reward_type, reward_value, active)
VALUES
  (
    '60000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '$10 Off Next Purchase',
    'Get $10 off your next ticket or merchandise purchase',
    500,
    'discount_fixed',
    '{"amount": 10, "currency": "USD"}'::jsonb,
    true
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '15% Off Merchandise',
    'Save 15% on any merchandise purchase',
    750,
    'discount_percentage',
    '{"percentage": 15}'::jsonb,
    true
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'VIP Upgrade',
    'Upgrade any general admission ticket to VIP',
    2000,
    'upgrade',
    '{"upgrade_type": "vip"}'::jsonb,
    true
  ),
  (
    '60000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Free Festival T-Shirt',
    'Redeem for a free festival t-shirt of your choice',
    1000,
    'free_item',
    '{"product_id": "40000000-0000-0000-0000-000000000001"}'::jsonb,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Insert notification templates
INSERT INTO notification_templates (type, channel, subject_template, body_template, variables)
VALUES
  (
    'order_confirmation',
    'email',
    'Order Confirmation - {{event_name}}',
    'Thank you for your purchase! Your order #{{order_id}} has been confirmed. You will receive your tickets shortly.',
    ARRAY['event_name', 'order_id', 'total_amount']
  ),
  (
    'event_reminder',
    'email',
    'Reminder: {{event_name}} is coming up!',
    'Don''t forget! {{event_name}} is happening on {{event_date}}. We can''t wait to see you there!',
    ARRAY['event_name', 'event_date', 'venue_name']
  ),
  (
    'waitlist_available',
    'email',
    'Tickets Available for {{event_name}}!',
    'Great news! Tickets are now available for {{event_name}}. You have 24 hours to complete your purchase.',
    ARRAY['event_name', 'event_date']
  )
ON CONFLICT (type, channel) DO NOTHING;
