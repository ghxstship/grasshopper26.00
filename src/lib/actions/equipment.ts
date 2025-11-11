'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Equipment, EquipmentAssignment } from '@/types/super-expansion';

export async function getEquipment(organizationId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('equipment')
    .select('*, category:equipment_categories(category_name)')
    .order('equipment_name');

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Equipment[];
}

export async function getEquipmentItem(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('equipment')
    .select('*, category:equipment_categories(*), assignments:equipment_assignments(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createEquipment(equipment: Partial<Equipment>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('equipment')
    .insert({
      ...equipment,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/equipment');
  return data;
}

export async function updateEquipment(id: string, updates: Partial<Equipment>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('equipment')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/equipment');
  revalidatePath(`/portal/equipment/${id}`);
  
  return data;
}

export async function getEquipmentAssignments(eventId?: string, equipmentId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('equipment_assignments')
    .select('*, equipment:equipment(equipment_name), event:events(event_name)')
    .order('assigned_from', { ascending: true });

  if (eventId) {
    query = query.eq('event_id', eventId);
  }
  if (equipmentId) {
    query = query.eq('equipment_id', equipmentId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as EquipmentAssignment[];
}

export async function createEquipmentAssignment(assignment: Partial<EquipmentAssignment>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('equipment_assignments')
    .insert({
      ...assignment,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/equipment');
  return data;
}
