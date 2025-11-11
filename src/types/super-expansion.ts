/**
 * Super Expansion Types
 * TypeScript types for comprehensive event production platform
 */

export type OrganizationType = 'production_company' | 'venue' | 'promoter' | 'artist_management' | 'vendor';
export type UserRole = 'system_admin' | 'organization_owner' | 'event_manager' | 'production_coordinator' | 'vendor_manager' | 'finance_manager' | 'marketing_manager' | 'staff_member' | 'vendor' | 'client' | 'viewer';
export type InvitationStatus = 'pending' | 'active' | 'suspended' | 'revoked';
export type VenueType = 'arena' | 'stadium' | 'theater' | 'club' | 'outdoor' | 'conference_center' | 'hotel' | 'private_space' | 'other';
export type BudgetType = 'revenue' | 'expense';
export type BudgetStatus = 'draft' | 'pending_approval' | 'approved' | 'locked' | 'closed';
export type PaymentStatus = 'not_invoiced' | 'invoiced' | 'partially_paid' | 'paid' | 'overdue';
export type LineItemStatus = 'planned' | 'approved' | 'committed' | 'invoiced' | 'paid' | 'cancelled';
export type TierType = 'general_admission' | 'vip' | 'reserved_seating' | 'early_bird' | 'group' | 'comp';
export type TicketStatus = 'reserved' | 'active' | 'transferred' | 'checked_in' | 'cancelled' | 'refunded' | 'voided';
export type TransactionType = 'ticket_sale' | 'merchandise' | 'food_beverage' | 'parking' | 'sponsorship' | 'vendor_payment' | 'refund' | 'chargeback';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded' | 'chargeback';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'venmo' | 'cash' | 'check' | 'wire_transfer' | 'comp';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'in_review' | 'completed' | 'cancelled' | 'deferred';
export type WorkType = 'regular' | 'overtime' | 'double_time' | 'travel';
export type TimeEntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'invoiced';
export type VendorStatus = 'prospective' | 'active' | 'inactive' | 'blacklisted';
export type ContractType = 'vendor' | 'venue' | 'talent' | 'sponsor' | 'service' | 'other';
export type ContractStatus = 'draft' | 'pending_review' | 'pending_signature' | 'active' | 'completed' | 'cancelled' | 'expired';
export type DeliverableStatus = 'pending' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
export type ExperienceLevel = 'entry' | 'intermediate' | 'advanced' | 'expert';
export type AssignmentType = 'full_event' | 'shift' | 'task_specific';
export type AssignmentStatus = 'scheduled' | 'confirmed' | 'checked_in' | 'on_break' | 'checked_out' | 'no_show' | 'cancelled';
export type ScheduleType = 'load_in' | 'rehearsal' | 'show' | 'load_out' | 'general';
export type ScheduleStatus = 'planned' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type CheckInMethod = 'qr_scan' | 'barcode_scan' | 'manual' | 'nfc' | 'facial_recognition';
export type CheckInStatus = 'completed' | 'duplicate' | 'invalid' | 'flagged';
export type CampaignType = 'email' | 'social_media' | 'paid_ads' | 'influencer' | 'pr' | 'partnership' | 'mixed';
export type CampaignStatus = 'planning' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
export type EmailCampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
export type SurveyType = 'pre_event' | 'post_event' | 'nps' | 'satisfaction' | 'custom';
export type SurveyStatus = 'draft' | 'scheduled' | 'active' | 'closed';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'in_progress' | 'resolved' | 'closed';
export type OwnershipType = 'owned' | 'rented' | 'borrowed';
export type ConditionStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'needs_repair' | 'out_of_service';
export type EquipmentAssignmentStatus = 'reserved' | 'checked_out' | 'in_use' | 'checked_in' | 'cancelled';
export type DocumentType = 'contract' | 'invoice' | 'receipt' | 'permit' | 'insurance' | 'rider' | 'floorplan' | 'schedule' | 'runsheet' | 'other';
export type DocumentStatus = 'draft' | 'review' | 'approved' | 'archived';
export type AccessLevel = 'private' | 'team' | 'organization' | 'public';
export type CommunicationType = 'email' | 'call' | 'meeting' | 'text' | 'in_person' | 'other';
export type CommunicationStatus = 'draft' | 'sent' | 'delivered' | 'read' | 'failed';
export type NoteType = 'general' | 'meeting' | 'phone_call' | 'observation' | 'decision' | 'action_item';

export interface Organization {
  id: string;
  organization_name: string;
  organization_slug: string;
  organization_type: OrganizationType | null;
  primary_email: string | null;
  primary_phone: string | null;
  city: string | null;
  state: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  organization_id: string;
  venue_name: string;
  venue_slug: string;
  venue_type: VenueType | null;
  max_capacity: number;
  city: string;
  state: string | null;
  primary_email: string | null;
  primary_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  event_id: string;
  organization_id: string;
  budget_name: string;
  budget_status: BudgetStatus;
  total_revenue_budgeted: number;
  total_expenses_budgeted: number;
  total_profit_budgeted: number;
  profit_margin_budgeted: number | null;
  total_revenue_actual: number;
  total_expenses_actual: number;
  total_profit_actual: number;
  created_at: string;
  updated_at: string;
}

export interface TicketTier {
  id: string;
  event_id: string;
  tier_name: string;
  tier_slug: string;
  tier_type: TierType | null;
  base_price: number;
  fees: number;
  taxes: number;
  total_price: number;
  total_capacity: number;
  tickets_sold: number;
  tickets_available: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  event_id: string;
  ticket_number: string;
  ticket_status: TicketStatus;
  final_price: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  event_id: string;
  task_name: string;
  description: string | null;
  priority: TaskPriority;
  task_status: TaskStatus;
  due_date: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  organization_id: string;
  vendor_name: string;
  vendor_status: VendorStatus;
  overall_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserOrganization {
  id: string;
  user_id: string;
  organization_id: string;
  role: UserRole;
  invitation_status: InvitationStatus;
  created_at: string;
  updated_at: string;
}

export interface BudgetLineItem {
  id: string;
  budget_id: string;
  line_item_name: string;
  item_type: BudgetType;
  budgeted_amount: number;
  actual_amount: number;
  line_item_status: LineItemStatus;
  created_at: string;
  updated_at: string;
}

export interface BudgetCategory {
  id: string;
  category_name: string;
  category_slug: string;
  budget_type: BudgetType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectPhase {
  id: string;
  event_id: string;
  phase_name: string;
  phase_slug: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  event_id: string;
  milestone_name: string;
  due_date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorCategory {
  id: string;
  category_name: string;
  category_slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  event_id: string;
  organization_id: string;
  contract_name: string;
  contract_number: string;
  contract_status: ContractStatus;
  contract_value: number;
  created_at: string;
  updated_at: string;
}

export interface Survey {
  id: string;
  event_id: string;
  organization_id: string;
  survey_name: string;
  survey_type: SurveyType | null;
  survey_status: SurveyStatus;
  total_sent: number;
  total_responses: number;
  response_rate: number | null;
  average_rating: number | null;
  nps_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  event_id: string;
  respondent_id: string | null;
  respondent_email: string | null;
  answers: Record<string, any>;
  completed_at: string;
  created_at: string;
}

export interface Incident {
  id: string;
  event_id: string;
  incident_title: string;
  description: string;
  severity: IncidentSeverity;
  incident_status: IncidentStatus;
  incident_location: string | null;
  occurred_at: string;
  reported_by: string | null;
  assigned_to: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentType {
  id: string;
  organization_id: string;
  type_name: string;
  type_slug: string;
  severity_level: IncidentSeverity | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  organization_id: string;
  equipment_name: string;
  equipment_slug: string;
  model_number: string | null;
  serial_number: string | null;
  manufacturer: string | null;
  ownership_type: OwnershipType | null;
  condition_status: ConditionStatus | null;
  is_available: boolean;
  current_location: string | null;
  created_at: string;
  updated_at: string;
}

export interface EquipmentCategory {
  id: string;
  category_name: string;
  category_slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipmentAssignment {
  id: string;
  equipment_id: string;
  event_id: string;
  assigned_to: string | null;
  assigned_from: string;
  assigned_until: string;
  assignment_status: EquipmentAssignmentStatus;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  event_id: string | null;
  organization_id: string;
  document_name: string;
  document_type: DocumentType | null;
  file_url: string;
  file_name: string;
  file_size_bytes: number | null;
  document_status: DocumentStatus;
  access_level: AccessLevel;
  is_public: boolean;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentCategory {
  id: string;
  category_name: string;
  category_slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Communication {
  id: string;
  event_id: string | null;
  organization_id: string;
  communication_type: CommunicationType;
  subject: string;
  body: string | null;
  from_user_id: string | null;
  communication_status: CommunicationStatus;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  event_id: string | null;
  organization_id: string;
  note_title: string | null;
  note_content: string;
  note_type: NoteType | null;
  is_private: boolean;
  is_pinned: boolean;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffPosition {
  id: string;
  organization_id: string;
  position_name: string;
  position_slug: string;
  experience_level: ExperienceLevel | null;
  default_hourly_rate: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffAssignment {
  id: string;
  event_id: string;
  user_id: string;
  position_id: string | null;
  assignment_type: AssignmentType | null;
  scheduled_start: string;
  scheduled_end: string;
  assignment_status: AssignmentStatus;
  hourly_rate: number | null;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  event_id: string;
  ticket_id: string;
  checked_in_at: string;
  check_in_method: CheckInMethod | null;
  check_in_gate: string | null;
  checked_in_by: string | null;
  check_in_status: CheckInStatus;
  created_at: string;
}

export interface MarketingCampaign {
  id: string;
  event_id: string;
  organization_id: string;
  campaign_name: string;
  campaign_slug: string;
  campaign_type: CampaignType | null;
  campaign_status: CampaignStatus;
  start_date: string;
  end_date: string | null;
  budgeted_amount: number | null;
  actual_spend: number;
  target_reach: number | null;
  actual_reach: number;
  created_at: string;
  updated_at: string;
}

export interface VendorDeliverable {
  id: string;
  event_id: string;
  vendor_id: string;
  deliverable_name: string;
  description: string | null;
  due_date: string;
  deliverable_status: DeliverableStatus;
  delivered_at: string | null;
  submission_url: string | null;
  approved_file_url: string | null;
  quality_check_passed: boolean | null;
  quality_checked_by: string | null;
  quality_checked_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductionSchedule {
  id: string;
  event_id: string;
  schedule_name: string;
  schedule_type: ScheduleType | null;
  schedule_date: string;
  start_time: string;
  end_time: string;
  schedule_status: ScheduleStatus;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  event_id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  work_type: WorkType | null;
  entry_status: TimeEntryStatus;
  is_billable: boolean;
  created_at: string;
  updated_at: string;
}
