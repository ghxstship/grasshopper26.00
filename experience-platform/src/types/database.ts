export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          domain: string | null
          logo_url: string | null
          favicon_url: string | null
          brand_colors: Json | null
          typography: Json | null
          tagline: string | null
          description: string | null
          social_links: Json | null
          contact_email: string | null
          settings: Json | null
          stripe_account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          domain?: string | null
          logo_url?: string | null
          favicon_url?: string | null
          brand_colors?: Json | null
          typography?: Json | null
          tagline?: string | null
          description?: string | null
          social_links?: Json | null
          contact_email?: string | null
          settings?: Json | null
          stripe_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          domain?: string | null
          logo_url?: string | null
          favicon_url?: string | null
          brand_colors?: Json | null
          typography?: Json | null
          tagline?: string | null
          description?: string | null
          social_links?: Json | null
          contact_email?: string | null
          settings?: Json | null
          stripe_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          brand_id: string
          name: string
          slug: string
          description: string | null
          event_type: string | null
          start_date: string
          end_date: string | null
          venue_name: string | null
          venue_address: Json | null
          venue_coordinates: unknown | null
          age_restriction: string | null
          capacity: number | null
          status: string | null
          hero_image_url: string | null
          hero_video_url: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          name: string
          slug: string
          description?: string | null
          event_type?: string | null
          start_date: string
          end_date?: string | null
          venue_name?: string | null
          venue_address?: Json | null
          venue_coordinates?: unknown | null
          age_restriction?: string | null
          capacity?: number | null
          status?: string | null
          hero_image_url?: string | null
          hero_video_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          name?: string
          slug?: string
          description?: string | null
          event_type?: string | null
          start_date?: string
          end_date?: string | null
          venue_name?: string | null
          venue_address?: Json | null
          venue_coordinates?: unknown | null
          age_restriction?: string | null
          capacity?: number | null
          status?: string | null
          hero_image_url?: string | null
          hero_video_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      artists: {
        Row: {
          id: string
          name: string
          slug: string
          bio: string | null
          genre_tags: string[] | null
          profile_image_url: string | null
          cover_image_url: string | null
          social_links: Json | null
          booking_email: string | null
          website_url: string | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          bio?: string | null
          genre_tags?: string[] | null
          profile_image_url?: string | null
          cover_image_url?: string | null
          social_links?: Json | null
          booking_email?: string | null
          website_url?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          bio?: string | null
          genre_tags?: string[] | null
          profile_image_url?: string | null
          cover_image_url?: string | null
          social_links?: Json | null
          booking_email?: string | null
          website_url?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ticket_types: {
        Row: {
          id: string
          event_id: string
          name: string
          description: string | null
          price: number
          quantity_available: number | null
          quantity_sold: number
          sale_start_date: string | null
          sale_end_date: string | null
          max_per_order: number | null
          stripe_price_id: string | null
          perks: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          description?: string | null
          price: number
          quantity_available?: number | null
          quantity_sold?: number
          sale_start_date?: string | null
          sale_end_date?: string | null
          max_per_order?: number | null
          stripe_price_id?: string | null
          perks?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          description?: string | null
          price?: number
          quantity_available?: number | null
          quantity_sold?: number
          sale_start_date?: string | null
          sale_end_date?: string | null
          max_per_order?: number | null
          stripe_price_id?: string | null
          perks?: Json | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          event_id: string
          stripe_payment_intent_id: string | null
          stripe_customer_id: string | null
          total_amount: number
          status: string | null
          order_items: Json | null
          billing_details: Json | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          stripe_payment_intent_id?: string | null
          stripe_customer_id?: string | null
          total_amount: number
          status?: string | null
          order_items?: Json | null
          billing_details?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          stripe_payment_intent_id?: string | null
          stripe_customer_id?: string | null
          total_amount?: number
          status?: string | null
          order_items?: Json | null
          billing_details?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          order_id: string
          ticket_type_id: string
          attendee_name: string | null
          attendee_email: string | null
          qr_code: string | null
          status: string | null
          scanned_at: string | null
          transferred_to_user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          ticket_type_id: string
          attendee_name?: string | null
          attendee_email?: string | null
          qr_code?: string | null
          status?: string | null
          scanned_at?: string | null
          transferred_to_user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          ticket_type_id?: string
          attendee_name?: string | null
          attendee_email?: string | null
          qr_code?: string | null
          status?: string | null
          scanned_at?: string | null
          transferred_to_user_id?: string | null
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          favorite_genres: string[] | null
          notification_preferences: Json | null
          loyalty_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          favorite_genres?: string[] | null
          notification_preferences?: Json | null
          loyalty_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          favorite_genres?: string[] | null
          notification_preferences?: Json | null
          loyalty_points?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
