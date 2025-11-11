'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Document } from '@/types/super-expansion';

export async function getDocuments(eventId?: string, organizationId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('documents')
    .select('*, category:document_categories(category_name)')
    .order('created_at', { ascending: false });

  if (eventId) {
    query = query.eq('event_id', eventId);
  }
  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Document[];
}

export async function getDocument(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('documents')
    .select('*, category:document_categories(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createDocument(document: Partial<Document>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('documents')
    .insert({
      ...document,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/documents');
  if (document.event_id) {
    revalidatePath(`/portal/events/${document.event_id}`);
  }
  
  return data;
}

export async function updateDocument(id: string, updates: Partial<Document>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/documents');
  revalidatePath(`/portal/documents/${id}`);
  
  return data;
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  revalidatePath('/portal/documents');
}
