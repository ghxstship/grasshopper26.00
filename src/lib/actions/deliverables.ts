'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { VendorDeliverable, DeliverableStatus } from '@/types/super-expansion';

export async function getDeliverables(eventId?: string, vendorId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('vendor_deliverables')
    .select(`
      *,
      vendor:vendors(vendor_name),
      event:events(event_name),
      task:tasks(task_name)
    `)
    .order('due_date', { ascending: true });

  if (eventId) {
    query = query.eq('event_id', eventId);
  }
  
  if (vendorId) {
    query = query.eq('vendor_id', vendorId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as VendorDeliverable[];
}

export async function getDeliverable(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('vendor_deliverables')
    .select(`
      *,
      vendor:vendors(*),
      event:events(*),
      contract:contracts(*),
      task:tasks(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createDeliverable(deliverable: Partial<VendorDeliverable>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('vendor_deliverables')
    .insert({
      ...deliverable,
      created_by: user.id,
      requested_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/deliverables');
  if (deliverable.event_id) {
    revalidatePath(`/portal/events/${deliverable.event_id}`);
  }
  
  return data;
}

export async function updateDeliverable(id: string, updates: Partial<VendorDeliverable>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('vendor_deliverables')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/deliverables');
  revalidatePath(`/portal/deliverables/${id}`);
  
  return data;
}

export async function updateDeliverableStatus(id: string, status: DeliverableStatus) {
  const updates: Partial<VendorDeliverable> = { deliverable_status: status };
  
  if (status === 'completed' || status === 'approved') {
    updates.delivered_at = new Date().toISOString();
  }
  
  return updateDeliverable(id, updates);
}

export async function submitDeliverable(id: string, submissionUrl: string) {
  return updateDeliverable(id, {
    deliverable_status: 'submitted',
    submission_url: submissionUrl,
    delivered_at: new Date().toISOString(),
  });
}

export async function approveDeliverable(id: string, approvedFileUrl?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return updateDeliverable(id, {
    deliverable_status: 'approved',
    quality_check_passed: true,
    quality_checked_by: user?.id,
    quality_checked_at: new Date().toISOString(),
    approved_file_url: approvedFileUrl,
  });
}

export async function rejectDeliverable(id: string, rejectionReason: string) {
  return updateDeliverable(id, {
    deliverable_status: 'rejected',
    quality_check_passed: false,
    rejection_reason: rejectionReason,
  });
}

export async function deleteDeliverable(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('vendor_deliverables')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  revalidatePath('/portal/deliverables');
}
