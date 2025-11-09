// Entertainment Platform Types for GVTEWAY

export interface Brand {
  id: string
  name: string
  slug: string
  domain?: string
  logo_url?: string
  favicon_url?: string
  brand_colors?: {
    primary: string
    secondary: string
  }
  typography?: Record<string, any>
  tagline?: string
  description?: string
  social_links?: Record<string, string>
  contact_email?: string
  settings?: Record<string, any>
  stripe_account_id?: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  brand_id?: string
  name: string
  slug: string
  description?: string
  event_type?: 'festival' | 'concert' | 'club_night' | 'tour' | 'other'
  start_date: string
  end_date?: string
  venue_name?: string
  venue_address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    zip?: string
  }
  venue_coordinates?: {
    lat: number
    lng: number
  }
  age_restriction?: string
  capacity?: number
  status: 'upcoming' | 'on_sale' | 'sold_out' | 'past' | 'cancelled'
  hero_image_url?: string
  hero_video_url?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface EventStage {
  id: string
  event_id: string
  name: string
  description?: string
  stage_type?: string
  capacity?: number
  created_at: string
}

export interface Artist {
  id: string
  name: string
  slug: string
  bio?: string
  genre_tags?: string[]
  profile_image_url?: string
  cover_image_url?: string
  social_links?: {
    spotify?: string
    instagram?: string
    twitter?: string
    facebook?: string
    soundcloud?: string
    youtube?: string
    website?: string
  }
  booking_email?: string
  website_url?: string
  verified: boolean
  created_at: string
  updated_at: string
}

export interface EventArtist {
  event_id: string
  artist_id: string
  performance_order?: number
  headliner: boolean
}

export interface EventSchedule {
  id: string
  event_id: string
  stage_id?: string
  artist_id?: string
  start_time: string
  end_time: string
  special_notes?: string
  created_at: string
}

export interface TicketType {
  id: string
  event_id: string
  name: string
  description?: string
  price: number
  quantity_available?: number
  quantity_sold: number
  sale_start_date?: string
  sale_end_date?: string
  max_per_order?: number
  stripe_price_id?: string
  perks?: string[]
  created_at: string
}

export interface Order {
  id: string
  user_id?: string
  event_id?: string
  stripe_payment_intent_id?: string
  stripe_customer_id?: string
  total_amount: number
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  order_items?: Array<{
    ticket_type_id: string
    quantity: number
    price: number
  }>
  billing_details?: {
    name?: string
    email?: string
    address?: Record<string, string>
  }
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  order_id?: string
  ticket_type_id?: string
  attendee_name?: string
  attendee_email?: string
  qr_code?: string
  status: 'active' | 'used' | 'transferred' | 'cancelled'
  scanned_at?: string
  transferred_to_user_id?: string
  created_at: string
}

export interface Product {
  id: string
  brand_id?: string
  event_id?: string
  name: string
  slug: string
  description?: string
  category?: string
  base_price: number
  images?: string[]
  stripe_product_id?: string
  status: 'active' | 'draft' | 'archived'
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name?: string
  sku?: string
  price?: number
  stock_quantity?: number
  stripe_price_id?: string
  variant_attributes?: {
    size?: string
    color?: string
    [key: string]: any
  }
  created_at: string
}

export interface ContentPost {
  id: string
  brand_id?: string
  title: string
  slug: string
  content?: string
  excerpt?: string
  author_id?: string
  post_type?: 'article' | 'news' | 'press_release' | 'guide'
  featured_image_url?: string
  tags?: string[]
  related_event_id?: string
  related_artist_ids?: string[]
  published_at?: string
  status: 'draft' | 'published' | 'archived'
  seo_metadata?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  created_at: string
  updated_at: string
}

export interface MediaGallery {
  id: string
  title: string
  description?: string
  media_type: 'photo' | 'video' | 'album'
  media_url: string
  thumbnail_url?: string
  event_id?: string
  artist_ids?: string[]
  tags?: string[]
  uploaded_by?: string
  created_at: string
}

export interface UserProfile {
  id: string
  username?: string
  display_name?: string
  bio?: string
  avatar_url?: string
  favorite_genres?: string[]
  notification_preferences?: Record<string, boolean>
  loyalty_points: number
  created_at: string
  updated_at: string
}

export interface UserEventSchedule {
  id: string
  user_id: string
  event_id: string
  schedule_items?: Array<{
    artist_id: string
    stage_id?: string
    notes?: string
  }>
  shared: boolean
  created_at: string
  updated_at: string
}

export interface BrandIntegration {
  id: string
  brand_id: string
  integration_type: string
  config: Record<string, any>
  status: 'active' | 'inactive' | 'error'
  last_sync_at?: string
  created_at: string
  updated_at: string
}

// Extended types with relations
export interface EventWithArtists extends Event {
  artists?: Artist[]
  stages?: EventStage[]
  ticket_types?: TicketType[]
}

export interface ArtistWithEvents extends Artist {
  events?: Event[]
  upcoming_performances?: EventSchedule[]
}

export interface OrderWithTickets extends Order {
  tickets?: Ticket[]
  event?: Event
}
