-- Universal Search Function
-- Provides full-text search across events, artists, products, and content posts

DROP FUNCTION IF EXISTS universal_search(text, integer);
CREATE OR REPLACE FUNCTION universal_search(
  search_query text,
  result_limit integer DEFAULT 20
)
RETURNS TABLE (
  result_type text,
  id uuid,
  name text,
  description text,
  image_url text,
  slug text,
  relevance float
) AS $$
BEGIN
  RETURN QUERY
  
  -- Search events
  SELECT 
    'event'::text as result_type,
    e.id,
    e.name,
    e.description,
    e.hero_image_url as image_url,
    e.slug,
    ts_rank(
      to_tsvector('english', e.name || ' ' || COALESCE(e.description, '')),
      plainto_tsquery('english', search_query)
    ) as relevance
  FROM events e
  WHERE 
    to_tsvector('english', e.name || ' ' || COALESCE(e.description, '')) 
    @@ plainto_tsquery('english', search_query)
    AND e.status IN ('upcoming', 'on_sale', 'sold_out')
  
  UNION ALL
  
  -- Search artists
  SELECT 
    'artist'::text as result_type,
    a.id,
    a.name,
    a.bio as description,
    a.profile_image_url as image_url,
    a.slug,
    ts_rank(
      to_tsvector('english', a.name || ' ' || COALESCE(a.bio, '') || ' ' || array_to_string(a.genre_tags, ' ')),
      plainto_tsquery('english', search_query)
    ) as relevance
  FROM artists a
  WHERE 
    to_tsvector('english', a.name || ' ' || COALESCE(a.bio, '') || ' ' || array_to_string(a.genre_tags, ' '))
    @@ plainto_tsquery('english', search_query)
  
  UNION ALL
  
  -- Search products
  SELECT 
    'product'::text as result_type,
    p.id,
    p.name,
    p.description,
    p.images[1] as image_url,
    p.slug,
    ts_rank(
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.category, '')),
      plainto_tsquery('english', search_query)
    ) as relevance
  FROM products p
  WHERE 
    to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.category, ''))
    @@ plainto_tsquery('english', search_query)
    AND p.status = 'active'
  
  UNION ALL
  
  -- Search content posts
  SELECT 
    'post'::text as result_type,
    cp.id,
    cp.title as name,
    cp.excerpt as description,
    cp.featured_image_url as image_url,
    cp.slug,
    ts_rank(
      to_tsvector('english', cp.title || ' ' || COALESCE(cp.content, '') || ' ' || array_to_string(cp.tags, ' ')),
      plainto_tsquery('english', search_query)
    ) as relevance
  FROM content_posts cp
  WHERE 
    to_tsvector('english', cp.title || ' ' || COALESCE(cp.content, '') || ' ' || array_to_string(cp.tags, ' '))
    @@ plainto_tsquery('english', search_query)
    AND cp.status = 'published'
  
  ORDER BY relevance DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Note: Full-text search indexes are created in 00011_add_search_optimization.sql
-- using search_vector columns with triggers

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION universal_search(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION universal_search(text, integer) TO anon;
