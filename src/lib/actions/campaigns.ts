'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { MarketingCampaign, CampaignStatus } from '@/types/super-expansion';

export async function getCampaigns(eventId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('marketing_campaigns')
    .select(`
      *,
      event:events(event_name)
    `)
    .order('start_date', { ascending: false });

  if (eventId) {
    query = query.eq('event_id', eventId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as MarketingCampaign[];
}

export async function getCampaign(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select(`
      *,
      event:events(*),
      email_campaigns(*),
      social_media_posts(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCampaign(campaign: Partial<MarketingCampaign>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('marketing_campaigns')
    .insert({
      ...campaign,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/marketing/campaigns');
  if (campaign.event_id) {
    revalidatePath(`/portal/events/${campaign.event_id}`);
  }
  
  return data;
}

export async function updateCampaign(id: string, updates: Partial<MarketingCampaign>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/marketing/campaigns');
  revalidatePath(`/portal/marketing/campaigns/${id}`);
  
  return data;
}

export async function updateCampaignStatus(id: string, status: CampaignStatus) {
  return updateCampaign(id, { campaign_status: status });
}

export async function updateCampaignMetrics(
  id: string,
  metrics: {
    actual_reach?: number;
    actual_engagement?: number;
    actual_conversions?: number;
    actual_revenue?: number;
    actual_spend?: number;
    impressions?: number;
    clicks?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  }
) {
  return updateCampaign(id, metrics);
}

export async function deleteCampaign(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('marketing_campaigns')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  revalidatePath('/portal/marketing/campaigns');
}
