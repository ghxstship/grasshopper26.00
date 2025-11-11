'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Venue } from '@/types/super-expansion';

export async function getVenues(organizationId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('venue_name');

  if (error) throw error;
  return data as Venue[];
}

export async function getVenueById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Venue;
}

export async function searchVenues(query: string, organizationId?: string) {
  const supabase = await createClient();
  
  let dbQuery = supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)
    .or(`venue_name.ilike.%${query}%,city.ilike.%${query}%`)
    .order('venue_name')
    .limit(20);

  if (organizationId) {
    dbQuery = dbQuery.eq('organization_id', organizationId);
  }

  const { data, error } = await dbQuery;

  if (error) throw error;
  return data as Venue[];
}

export async function createVenue(organizationId: string, formData: FormData) {
  const supabase = await createClient();

  const venue = {
    organization_id: organizationId,
    venue_name: formData.get('venue_name') as string,
    venue_slug: (formData.get('venue_name') as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-'),
    venue_type: formData.get('venue_type') as string,
    address_line1: formData.get('address_line1') as string,
    address_line2: formData.get('address_line2') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    postal_code: formData.get('postal_code') as string,
    country: formData.get('country') as string || 'US',
    max_capacity: parseInt(formData.get('max_capacity') as string),
    standing_capacity: parseInt(formData.get('standing_capacity') as string) || null,
    seated_capacity: parseInt(formData.get('seated_capacity') as string) || null,
    vip_capacity: parseInt(formData.get('vip_capacity') as string) || null,
    primary_contact_name: formData.get('primary_contact_name') as string,
    primary_email: formData.get('primary_email') as string,
    primary_phone: formData.get('primary_phone') as string,
    website_url: formData.get('website_url') as string,
  };

  const { data, error } = await supabase
    .from('venues')
    .insert(venue)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/portal/venues');
  return data;
}

export async function updateVenue(id: string, formData: FormData) {
  const supabase = await createClient();

  const updates = {
    venue_name: formData.get('venue_name') as string,
    venue_type: formData.get('venue_type') as string,
    address_line1: formData.get('address_line1') as string,
    address_line2: formData.get('address_line2') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    postal_code: formData.get('postal_code') as string,
    max_capacity: parseInt(formData.get('max_capacity') as string),
    standing_capacity: parseInt(formData.get('standing_capacity') as string) || null,
    seated_capacity: parseInt(formData.get('seated_capacity') as string) || null,
    vip_capacity: parseInt(formData.get('vip_capacity') as string) || null,
    primary_contact_name: formData.get('primary_contact_name') as string,
    primary_email: formData.get('primary_email') as string,
    primary_phone: formData.get('primary_phone') as string,
    website_url: formData.get('website_url') as string,
    base_rental_cost: parseFloat(formData.get('base_rental_cost') as string) || null,
    security_deposit: parseFloat(formData.get('security_deposit') as string) || null,
  };

  const { data, error } = await supabase
    .from('venues')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/portal/venues');
  revalidatePath(`/portal/venues/${id}`);
  return data;
}

export async function getVenuesByCity(city: string, organizationId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)
    .ilike('city', city)
    .order('venue_name');

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Venue[];
}
