import { createClient } from '@/lib/supabase/server';

/**
 * RLS (Row Level Security) Helper Functions
 * These functions help verify and enforce RLS policies
 */

export async function verifyUserOwnership(
  tableName: string,
  recordId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(tableName)
    .select('user_id')
    .eq('id', recordId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.user_id === userId;
}

export async function verifyBrandAccess(
  brandId: string,
  userId: string,
  requiredRole: string[] = ['owner', 'admin', 'editor']
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('brand_admins')
    .select('role')
    .eq('brand_id', brandId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return requiredRole.includes(data.role);
}

export async function getUserBrandId(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('brand_admins')
    .select('brand_id')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.brand_id;
}

export async function canAccessEvent(
  eventId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  // Get event's brand_id
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('brand_id')
    .eq('id', eventId)
    .single();

  if (eventError || !event) {
    return false;
  }

  // Check if user has access to this brand
  return verifyBrandAccess(event.brand_id, userId);
}

export async function canAccessOrder(
  orderId: string,
  userId: string
): Promise<boolean> {
  return verifyUserOwnership('orders', orderId, userId);
}

export async function canAccessTicket(
  ticketId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  // Get ticket's order
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('order_id, orders(user_id)')
    .eq('id', ticketId)
    .single();

  if (error || !ticket) {
    return false;
  }

  return (ticket.orders as any)?.user_id === userId;
}

/**
 * Sanitization helpers
 */

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validation helpers
 */

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Rate limiting helpers
 */

export function getClientIdentifier(req: Request): string {
  // Try to get user ID from auth, otherwise use IP
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
  return ip;
}

/**
 * Audit logging helpers
 */

export async function logSecurityEvent(
  eventType: string,
  userId: string | null,
  details: Record<string, any>
): Promise<void> {
  const supabase = await createClient();

  await supabase.from('audit_logs').insert({
    table_name: 'security_events',
    operation: eventType,
    user_id: userId,
    new_data: details,
  });
}
