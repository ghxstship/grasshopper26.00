// Production Advancing System Types

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CatalogItem {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  item_type: 'equipment' | 'access' | 'service' | 'hospitality' | 'travel' | 'custom';
  make: string | null;
  model: string | null;
  specifications: Record<string, any> | null;
  total_quantity: number | null;
  available_quantity: number | null;
  base_price: number | null;
  price_unit: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  tags: string[] | null;
  requires_approval: boolean;
  lead_time_days: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: CatalogCategory;
  modifiers?: CatalogItemModifier[];
}

export interface CatalogItemModifier {
  id: string;
  item_id: string;
  name: string;
  description: string | null;
  modifier_type: 'addon' | 'option' | 'configuration';
  price_adjustment: number | null;
  affects_quantity: boolean;
  is_required: boolean;
  display_order: number | null;
  created_at: string;
  options?: CatalogModifierOption[];
}

export interface CatalogModifierOption {
  id: string;
  modifier_id: string;
  option_name: string;
  option_value: string;
  price_adjustment: number | null;
  display_order: number | null;
  created_at: string;
}

export interface ProductionAdvance {
  id: string;
  advance_number: string;
  event_id: string | null;
  event_name: string;
  company_name: string;
  submitter_user_id: string;
  point_of_contact_name: string;
  point_of_contact_email: string;
  point_of_contact_phone: string | null;
  service_start_date: string;
  service_end_date: string;
  duration_days: number;
  purpose: string | null;
  special_considerations: string | null;
  additional_notes: string | null;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';
  approval_status: 'pending' | 'approved' | 'rejected' | 'partially_approved' | null;
  fulfillment_status: 'pending' | 'in_progress' | 'partially_fulfilled' | 'fulfilled' | 'cancelled' | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  assigned_to_user_ids: string[] | null;
  internal_notes: string | null;
  total_items: number;
  total_estimated_cost: number | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  items?: ProductionAdvanceItem[];
  comments?: ProductionAdvanceComment[];
  status_history?: ProductionAdvanceStatusHistory[];
}

export interface ProductionAdvanceItem {
  id: string;
  advance_id: string;
  catalog_item_id: string | null;
  category_name: string;
  item_name: string;
  item_description: string | null;
  make: string | null;
  model: string | null;
  quantity: number;
  modifiers: Record<string, any> | null;
  specific_start_date: string | null;
  specific_end_date: string | null;
  item_notes: string | null;
  unit_price: number | null;
  total_price: number | null;
  fulfillment_status: 'pending' | 'assigned' | 'fulfilled' | 'unavailable' | null;
  assigned_unit_ids: string[] | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface PhysicalUnit {
  id: string;
  catalog_item_id: string | null;
  unit_number: string;
  serial_number: string | null;
  asset_tag: string | null;
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair' | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  status: 'available' | 'in_use' | 'maintenance' | 'retired' | null;
  current_location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductionAdvanceStatusHistory {
  id: string;
  advance_id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string | null;
  change_reason: string | null;
  notes: string | null;
  created_at: string;
}

export interface ProductionAdvanceComment {
  id: string;
  advance_id: string;
  user_id: string | null;
  comment_text: string;
  is_internal: boolean;
  mentioned_user_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface AdvanceTemplate {
  id: string;
  created_by: string | null;
  template_name: string;
  description: string | null;
  company_name: string | null;
  template_items: Record<string, any> | null;
  default_purpose: string | null;
  default_special_considerations: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Cart-specific types
export interface CartItem {
  id: string; // Temporary ID for cart management
  catalog_item_id: string;
  name: string; // Alias for item_name for compatibility
  category_name: string;
  item_name: string;
  item_description: string | null;
  make: string | null;
  model: string | null;
  quantity: number;
  modifiers: Array<{
    modifier_id?: string;
    name: string;
    value?: string;
    option_id?: string;
  }>;
  notes?: string | null; // Alias for item_notes
  item_notes: string | null;
  thumbnail_url: string | null;
}

export interface AdvanceFormData {
  event_id: string | null;
  event_name: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  service_start_date: Date | null;
  service_end_date: Date | null;
  purpose: string;
  special_considerations: string;
  additional_notes: string;
}

// API Request/Response types
export interface CreateAdvanceRequest {
  advance: Omit<AdvanceFormData, 'service_start_date' | 'service_end_date'> & {
    service_start_date: string;
    service_end_date: string;
  };
  items: Omit<CartItem, 'id' | 'thumbnail_url'>[];
  submit: boolean; // true to submit, false to save as draft
}

export interface CreateAdvanceResponse {
  advance: ProductionAdvance;
}

export interface ApproveAdvanceRequest {
  decision: 'approved' | 'rejected' | 'partially_approved';
  rejection_reason?: string;
  assigned_users?: string[];
  internal_notes?: string;
}

export interface AssignUnitsRequest {
  item_id: string;
  unit_ids: string[];
}
