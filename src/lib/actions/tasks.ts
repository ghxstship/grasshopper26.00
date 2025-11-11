'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Task, ProjectPhase, ProjectMilestone } from '@/types/super-expansion';

export async function getTasksByEvent(eventId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      phase:project_phases(*),
      milestone:project_milestones(*),
      category:task_categories(*),
      assigned_user:auth.users(id, email)
    `)
    .eq('event_id', eventId)
    .order('due_date');

  if (error) throw error;
  return data;
}

export async function getTasksByUser(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      event:events(id, event_name, event_start_date)
    `)
    .eq('assigned_to', userId)
    .in('task_status', ['todo', 'in_progress', 'blocked'])
    .order('due_date');

  if (error) throw error;
  return data;
}

export async function createTask(eventId: string, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const task = {
    event_id: eventId,
    task_name: formData.get('task_name') as string,
    description: formData.get('description') as string,
    priority: formData.get('priority') as string || 'medium',
    task_status: 'todo',
    due_date: formData.get('due_date') as string,
    assigned_to: formData.get('assigned_to') as string || null,
    phase_id: formData.get('phase_id') as string || null,
    milestone_id: formData.get('milestone_id') as string || null,
    category_id: formData.get('category_id') as string || null,
    estimated_hours: parseFloat(formData.get('estimated_hours') as string) || null,
    created_by: user.id,
    assigned_by: user.id,
    assigned_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/portal/events/${eventId}/tasks`);
  return data;
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createClient();

  const updates: any = {
    task_name: formData.get('task_name') as string,
    description: formData.get('description') as string,
    priority: formData.get('priority') as string,
    task_status: formData.get('task_status') as string,
    due_date: formData.get('due_date') as string,
    assigned_to: formData.get('assigned_to') as string || null,
    completion_percentage: parseFloat(formData.get('completion_percentage') as string) || 0,
  };

  if (updates.task_status === 'completed' && !updates.completed_at) {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  const { data: task } = await supabase
    .from('tasks')
    .select('event_id')
    .eq('id', id)
    .single();

  revalidatePath(`/portal/events/${task?.event_id}/tasks`);
  return data;
}

export async function getProjectPhases(eventId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('project_phases')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data as ProjectPhase[];
}

export async function createProjectPhase(eventId: string, formData: FormData) {
  const supabase = await createClient();

  const phase = {
    event_id: eventId,
    phase_name: formData.get('phase_name') as string,
    phase_slug: (formData.get('phase_name') as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-'),
    description: formData.get('description') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
  };

  const { data, error } = await supabase
    .from('project_phases')
    .insert(phase)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/portal/events/${eventId}/tasks`);
  return data;
}

export async function getMilestones(eventId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('project_milestones')
    .select(`
      *,
      phase:project_phases(*),
      owner:auth.users(id, email)
    `)
    .eq('event_id', eventId)
    .order('due_date');

  if (error) throw error;
  return data;
}

export async function createMilestone(eventId: string, formData: FormData) {
  const supabase = await createClient();

  const milestone = {
    event_id: eventId,
    milestone_name: formData.get('milestone_name') as string,
    description: formData.get('description') as string,
    due_date: formData.get('due_date') as string,
    phase_id: formData.get('phase_id') as string || null,
    owner_id: formData.get('owner_id') as string || null,
    is_critical: formData.get('is_critical') === 'true',
  };

  const { data, error } = await supabase
    .from('project_milestones')
    .insert(milestone)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/portal/events/${eventId}/tasks`);
  return data;
}
