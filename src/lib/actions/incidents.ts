'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Incident, IncidentStatus } from '@/types/super-expansion';

export async function getIncidents(eventId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('incidents')
    .select('*, incident_type:incident_types(type_name)')
    .eq('event_id', eventId)
    .order('occurred_at', { ascending: false });

  if (error) throw error;
  return data as Incident[];
}

export async function getIncident(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('incidents')
    .select('*, incident_type:incident_types(*), event:events(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createIncident(incident: Partial<Incident>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('incidents')
    .insert({
      ...incident,
      reported_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  
  if (incident.event_id) {
    revalidatePath(`/portal/events/${incident.event_id}`);
  }
  
  return data;
}

export async function updateIncident(id: string, updates: Partial<Incident>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('incidents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/incidents');
  revalidatePath(`/portal/incidents/${id}`);
  
  return data;
}

export async function updateIncidentStatus(id: string, status: IncidentStatus) {
  const updates: Partial<Incident> = { incident_status: status };
  
  if (status === 'resolved') {
    updates.resolved_at = new Date().toISOString();
  } else if (status === 'closed') {
    updates.closed_at = new Date().toISOString();
  }
  
  return updateIncident(id, updates);
}
