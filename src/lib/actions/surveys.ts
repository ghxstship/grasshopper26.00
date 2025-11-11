'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Survey, SurveyResponse } from '@/types/super-expansion';

export async function getSurveys(eventId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('surveys')
    .select('*, event:events(event_name)')
    .order('created_at', { ascending: false });

  if (eventId) {
    query = query.eq('event_id', eventId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Survey[];
}

export async function getSurvey(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('surveys')
    .select('*, event:events(*), responses:survey_responses(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createSurvey(survey: Partial<Survey>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('surveys')
    .insert({
      ...survey,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/surveys');
  return data;
}

export async function updateSurvey(id: string, updates: Partial<Survey>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('surveys')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/surveys');
  revalidatePath(`/portal/surveys/${id}`);
  
  return data;
}

export async function submitSurveyResponse(response: Partial<SurveyResponse>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('survey_responses')
    .insert({
      ...response,
      respondent_id: user?.id,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  
  await supabase.rpc('increment_survey_responses', { survey_id: response.survey_id });
  
  return data;
}

export async function getSurveyResponses(surveyId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('survey_id', surveyId)
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return data as SurveyResponse[];
}
