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
          brand_colors: Json
          typography: Json
          tagline: string | null
          description: string | null
          contact_email: string | null
          support_email: string | null
          social_links: Json | null
          metadata: Json | null
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
          brand_colors?: Json
          typography?: Json
          tagline?: string | null
          description?: string | null
          contact_email?: string | null
          support_email?: string | null
          social_links?: Json | null
          metadata?: Json | null
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
          brand_colors?: Json
          typography?: Json
          tagline?: string | null
          description?: string | null
          contact_email?: string | null
          support_email?: string | null
          social_links?: Json | null
          metadata?: Json | null
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
          age_restriction: string | null
          capacity: number | null
          status: string
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
          age_restriction?: string | null
          capacity?: number | null
          status?: string
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
          age_restriction?: string | null
          capacity?: number | null
          status?: string
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
          genre_tags: string[]
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
          genre_tags: string[]
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
          genre_tags?: string[]
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
      orders: {
        Row: {
          id: string
          user_id: string
          brand_id: string
          status: string
          total_amount: string
          currency: string
          payment_intent_id: string | null
          billing_details: Json | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brand_id: string
          status?: string
          total_amount: string
          currency?: string
          payment_intent_id?: string | null
          billing_details?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand_id?: string
          status?: string
          total_amount?: string
          currency?: string
          payment_intent_id?: string | null
          billing_details?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          channel: string
          title: string
          message: string
          action_url: string | null
          action_label: string | null
          metadata: Json | null
          read: boolean
          read_at: string | null
          sent: boolean
          sent_at: string | null
          failed: boolean
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          channel?: string
          title: string
          message: string
          action_url?: string | null
          action_label?: string | null
          metadata?: Json | null
          read?: boolean
          read_at?: string | null
          sent?: boolean
          sent_at?: string | null
          failed?: boolean
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          channel?: string
          title?: string
          message?: string
          action_url?: string | null
          action_label?: string | null
          metadata?: Json | null
          read?: boolean
          read_at?: string | null
          sent?: boolean
          sent_at?: string | null
          failed?: boolean
          error_message?: string | null
          created_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          order_id: string
          ticket_type_id: string
          user_id: string
          qr_code: string
          status: string
          attendee_name: string | null
          attendee_email: string | null
          scanned_at: string | null
          scanned_by: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          ticket_type_id: string
          user_id: string
          qr_code: string
          status?: string
          attendee_name?: string | null
          attendee_email?: string | null
          scanned_at?: string | null
          scanned_by?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          ticket_type_id?: string
          user_id?: string
          qr_code?: string
          status?: string
          attendee_name?: string | null
          attendee_email?: string | null
          scanned_at?: string | null
          scanned_by?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          phone: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          metadata?: Json | null
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
