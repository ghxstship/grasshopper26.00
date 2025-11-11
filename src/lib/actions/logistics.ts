'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ProductionSchedule, ScheduleStatus } from '@/types/super-expansion';

export async function getProductionSchedules(eventId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('production_schedules')
    .select('*')
    .eq('event_id', eventId)
    .order('schedule_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data as ProductionSchedule[];
}

export async function getProductionSchedule(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('production_schedules')
    .select(`
      *,
      event:events(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProductionSchedule(schedule: Partial<ProductionSchedule>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('production_schedules')
    .insert({
      ...schedule,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  
  if (schedule.event_id) {
    revalidatePath(`/portal/events/${schedule.event_id}/logistics`);
  }
  
  return data;
}

export async function updateProductionSchedule(id: string, updates: Partial<ProductionSchedule>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('production_schedules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/production/schedules');
  return data;
}

export async function updateScheduleStatus(id: string, status: ScheduleStatus) {
  return updateProductionSchedule(id, { schedule_status: status });
}

export async function deleteProductionSchedule(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('production_schedules')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  revalidatePath('/portal/production/schedules');
}

export async function getEventLogistics(eventId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('event_logistics')
    .select('*')
    .eq('event_id', eventId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upsertEventLogistics(eventId: string, logistics: any) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('event_logistics')
    .upsert({
      event_id: eventId,
      ...logistics,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath(`/portal/events/${eventId}/logistics`);
  return data;
}
