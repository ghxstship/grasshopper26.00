'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getStaffPositions(organizationId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('staff_positions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data;
}

export async function getStaffAssignments(eventId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('staff_assignments')
    .select(`
      *,
      position:staff_positions(position_name)
    `)
    .eq('event_id', eventId)
    .order('scheduled_start');

  if (error) throw error;
  return data;
}

export async function createStaffAssignment(eventId: string, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const assignment = {
    event_id: eventId,
    user_id: formData.get('user_id') as string,
    position_id: formData.get('position_id') as string,
    assignment_type: formData.get('assignment_type') as string,
    scheduled_start: formData.get('scheduled_start') as string,
    scheduled_end: formData.get('scheduled_end') as string,
    hourly_rate: parseFloat(formData.get('hourly_rate') as string) || null,
    assigned_location: formData.get('assigned_location') as string,
    assignment_status: 'scheduled',
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from('staff_assignments')
    .insert(assignment)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/portal/events/${eventId}/staff`);
  return data;
}

export async function checkInStaff(assignmentId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('staff_assignments')
    .update({
      assignment_status: 'checked_in',
      actual_start: new Date().toISOString(),
      checked_in_at: new Date().toISOString(),
      checked_in_by: user.id,
    })
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/portal/events/${data.event_id}/staff`);
  return data;
}

export async function checkOutStaff(assignmentId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: assignment } = await supabase
    .from('staff_assignments')
    .select('*')
    .eq('id', assignmentId)
    .single();

  if (!assignment) throw new Error('Assignment not found');

  const actualStart = new Date(assignment.actual_start || assignment.scheduled_start);
  const actualEnd = new Date();
  const actualHours = (actualEnd.getTime() - actualStart.getTime()) / (1000 * 60 * 60);

  const { data, error } = await supabase
    .from('staff_assignments')
    .update({
      assignment_status: 'checked_out',
      actual_end: actualEnd.toISOString(),
      actual_hours: actualHours,
      checked_out_at: actualEnd.toISOString(),
      checked_out_by: user.id,
      total_cost: assignment.hourly_rate ? assignment.hourly_rate * actualHours : null,
    })
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/portal/events/${data.event_id}/staff`);
  return data;
}

export async function getStaffStats(eventId: string) {
  const supabase = await createClient();
  
  const { data: assignments } = await supabase
    .from('staff_assignments')
    .select('*')
    .eq('event_id', eventId);

  if (!assignments) return null;

  const totalAssignments = assignments.length;
  const checkedIn = assignments.filter(a => 
    ['checked_in', 'on_break'].includes(a.assignment_status)
  ).length;
  const checkedOut = assignments.filter(a => a.assignment_status === 'checked_out').length;
  const noShows = assignments.filter(a => a.assignment_status === 'no_show').length;
  const totalCost = assignments
    .filter(a => a.total_cost)
    .reduce((sum, a) => sum + (a.total_cost || 0), 0);

  return {
    totalAssignments,
    checkedIn,
    checkedOut,
    noShows,
    totalCost,
    activeStaff: checkedIn,
  };
}
