-- Full-text search optimization with GIN indexes and search functions

-- Add tsvector columns for full-text search
ALTER TABLE events ADD COLUMN search_vector tsvector;
ALTER TABLE artists ADD COLUMN search_vector tsvector;
ALTER TABLE products ADD COLUMN search_vector tsvector;
ALTER TABLE content_posts ADD COLUMN search_vector tsvector;

-- Create function to update event search vector
CREATE OR REPLACE FUNCTION events_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.venue_name, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.event_type, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update artist search vector
CREATE OR REPLACE FUNCTION artists_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.bio, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.genre_tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update product search vector
CREATE OR REPLACE FUNCTION products_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update content post search vector
CREATE OR REPLACE FUNCTION content_posts_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update search vectors
CREATE TRIGGER events_search_vector_trigger
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION events_search_vector_update();

CREATE TRIGGER artists_search_vector_trigger
  BEFORE INSERT OR UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION artists_search_vector_update();

CREATE TRIGGER products_search_vector_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION products_search_vector_update();

CREATE TRIGGER content_posts_search_vector_trigger
  BEFORE INSERT OR UPDATE ON content_posts
  FOR EACH ROW EXECUTE FUNCTION content_posts_search_vector_update();

-- Update existing records
UPDATE events SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(venue_name, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(event_type, '')), 'D');

UPDATE artists SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(bio, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(genre_tags, ' '), '')), 'C');

UPDATE products SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(category, '')), 'C');

UPDATE content_posts SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(excerpt, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(content, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'D');

-- Create GIN indexes for fast full-text search
CREATE INDEX idx_events_search_vector ON events USING GIN(search_vector);
CREATE INDEX idx_artists_search_vector ON artists USING GIN(search_vector);
CREATE INDEX idx_products_search_vector ON products USING GIN(search_vector);
CREATE INDEX idx_content_posts_search_vector ON content_posts USING GIN(search_vector);

-- Create additional GIN indexes for array fields
CREATE INDEX idx_artists_genre_tags ON artists USING GIN(genre_tags);
CREATE INDEX idx_content_posts_tags ON content_posts USING GIN(tags);

-- Universal search function
CREATE OR REPLACE FUNCTION universal_search(
  search_query text,
  result_limit integer DEFAULT 20
)
RETURNS TABLE (
  result_type text,
  id uuid,
  title text,
  description text,
  image_url text,
  url text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  -- Search events
  SELECT 
    'event'::text,
    e.id,
    e.name,
    e.description,
    e.hero_image_url,
    '/events/' || e.slug,
    ts_rank(e.search_vector, plainto_tsquery('english', search_query))
  FROM events e
  WHERE e.search_vector @@ plainto_tsquery('english', search_query)
    AND e.deleted_at IS NULL
    AND e.status IN ('upcoming', 'on_sale', 'sold_out')
  
  UNION ALL
  
  -- Search artists
  SELECT 
    'artist'::text,
    a.id,
    a.name,
    a.bio,
    a.profile_image_url,
    '/artists/' || a.slug,
    ts_rank(a.search_vector, plainto_tsquery('english', search_query))
  FROM artists a
  WHERE a.search_vector @@ plainto_tsquery('english', search_query)
    AND a.deleted_at IS NULL
  
  UNION ALL
  
  -- Search products
  SELECT 
    'product'::text,
    p.id,
    p.name,
    p.description,
    p.images[1],
    '/shop/' || p.slug,
    ts_rank(p.search_vector, plainto_tsquery('english', search_query))
  FROM products p
  WHERE p.search_vector @@ plainto_tsquery('english', search_query)
    AND p.deleted_at IS NULL
    AND p.status = 'active'
  
  UNION ALL
  
  -- Search content posts
  SELECT 
    'content'::text,
    c.id,
    c.title,
    c.excerpt,
    c.featured_image_url,
    '/blog/' || c.slug,
    ts_rank(c.search_vector, plainto_tsquery('english', search_query))
  FROM content_posts c
  WHERE c.search_vector @@ plainto_tsquery('english', search_query)
    AND c.deleted_at IS NULL
    AND c.status = 'published'
  
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Autocomplete search function
CREATE OR REPLACE FUNCTION search_autocomplete(
  search_query text,
  result_limit integer DEFAULT 10
)
RETURNS TABLE (
  suggestion text,
  result_type text,
  result_count integer
) AS $$
BEGIN
  RETURN QUERY
  -- Event name suggestions
  SELECT 
    e.name,
    'event'::text,
    COUNT(*)::integer
  FROM events e
  WHERE e.name ILIKE search_query || '%'
    AND e.deleted_at IS NULL
    AND e.status IN ('upcoming', 'on_sale', 'sold_out')
  GROUP BY e.name
  
  UNION ALL
  
  -- Artist name suggestions
  SELECT 
    a.name,
    'artist'::text,
    COUNT(*)::integer
  FROM artists a
  WHERE a.name ILIKE search_query || '%'
    AND a.deleted_at IS NULL
  GROUP BY a.name
  
  UNION ALL
  
  -- Genre suggestions
  SELECT 
    DISTINCT unnest(a.genre_tags),
    'genre'::text,
    COUNT(*)::integer
  FROM artists a
  WHERE unnest(a.genre_tags) ILIKE search_query || '%'
  GROUP BY unnest(a.genre_tags)
  
  ORDER BY result_count DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search by location function
CREATE OR REPLACE FUNCTION search_events_by_location(
  search_lat double precision,
  search_lon double precision,
  radius_miles double precision DEFAULT 50,
  result_limit integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  name text,
  venue_name text,
  start_date timestamptz,
  distance_miles double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.venue_name,
    e.start_date,
    -- Calculate distance using Haversine formula (approximate)
    (
      3959 * acos(
        cos(radians(search_lat)) * 
        cos(radians(e.venue_coordinates[0])) * 
        cos(radians(e.venue_coordinates[1]) - radians(search_lon)) + 
        sin(radians(search_lat)) * 
        sin(radians(e.venue_coordinates[0]))
      )
    ) as distance
  FROM events e
  WHERE e.venue_coordinates IS NOT NULL
    AND e.deleted_at IS NULL
    AND e.status IN ('upcoming', 'on_sale', 'sold_out')
    AND (
      3959 * acos(
        cos(radians(search_lat)) * 
        cos(radians(e.venue_coordinates[0])) * 
        cos(radians(e.venue_coordinates[1]) - radians(search_lon)) + 
        sin(radians(search_lat)) * 
        sin(radians(e.venue_coordinates[0]))
      )
    ) <= radius_miles
  ORDER BY distance ASC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
