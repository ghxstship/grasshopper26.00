'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Vendor, VendorCategory, Contract } from '@/types/super-expansion';

export async function getVendors(organizationId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('vendors')
    .select(`
      *,
      category:vendor_categories(*)
    `)
    .eq('organization_id', organizationId)
    .order('vendor_name');

  if (error) throw error;
  return data;
}

export async function getVendorById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('vendors')
    .select(`
      *,
      category:vendor_categories(*),
      contracts:contracts(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getVendorCategories(organizationId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('vendor_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (organizationId) {
    query = query.or(`organization_id.is.null,organization_id.eq.${organizationId}`);
  } else {
    query = query.is('organization_id', null);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as VendorCategory[];
}

export async function createVendor(organizationId: string, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const vendor = {
    organization_id: organizationId,
    vendor_name: formData.get('vendor_name') as string,
    vendor_slug: (formData.get('vendor_name') as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-'),
    company_name: formData.get('company_name') as string,
    category_id: formData.get('category_id') as string,
    primary_contact_name: formData.get('primary_contact_name') as string,
    primary_email: formData.get('primary_email') as string,
    primary_phone: formData.get('primary_phone') as string,
    website_url: formData.get('website_url') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    vendor_status: 'active',
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from('vendors')
    .insert(vendor)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/portal/vendors');
  return data;
}

export async function updateVendor(id: string, formData: FormData) {
  const supabase = await createClient();

  const updates = {
    vendor_name: formData.get('vendor_name') as string,
    company_name: formData.get('company_name') as string,
    category_id: formData.get('category_id') as string,
    primary_contact_name: formData.get('primary_contact_name') as string,
    primary_email: formData.get('primary_email') as string,
    primary_phone: formData.get('primary_phone') as string,
    website_url: formData.get('website_url') as string,
    address_line1: formData.get('address_line1') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    postal_code: formData.get('postal_code') as string,
    vendor_status: formData.get('vendor_status') as string,
    is_preferred: formData.get('is_preferred') === 'true',
  };

  const { data, error } = await supabase
    .from('vendors')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/portal/vendors');
  revalidatePath(`/portal/vendors/${id}`);
  return data;
}

export async function rateVendor(id: string, ratings: {
  quality_rating: number;
  reliability_rating: number;
  communication_rating: number;
}) {
  const supabase = await createClient();

  const overall_rating = (
    ratings.quality_rating +
    ratings.reliability_rating +
    ratings.communication_rating
  ) / 3;

  const { data, error } = await supabase
    .from('vendors')
    .update({
      ...ratings,
      overall_rating,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/portal/vendors/${id}`);
  return data;
}

export async function getContracts(eventId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      vendor:vendors(*)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createContract(eventId: string, organizationId: string, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Generate contract number
  const contractNumber = `CNT-${Date.now()}`;

  const contract = {
    event_id: eventId,
    organization_id: organizationId,
    vendor_id: formData.get('vendor_id') as string,
    contract_number: contractNumber,
    contract_name: formData.get('contract_name') as string,
    contract_type: formData.get('contract_type') as string,
    contract_value: parseFloat(formData.get('contract_value') as string),
    effective_date: formData.get('effective_date') as string,
    expiration_date: formData.get('expiration_date') as string,
    payment_schedule: formData.get('payment_schedule') as string,
    terms_and_conditions: formData.get('terms_and_conditions') as string,
    contract_status: 'draft',
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from('contracts')
    .insert(contract)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/portal/events/${eventId}/contracts`);
  return data;
}

export async function updateContractStatus(id: string, status: string) {
  const supabase = await createClient();

  const updates: any = {
    contract_status: status,
  };

  if (status === 'active') {
    const { data: { user } } = await supabase.auth.getUser();
    updates.signed_by_organization = true;
    updates.organization_signed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('contracts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  const { data: contract } = await supabase
    .from('contracts')
    .select('event_id')
    .eq('id', id)
    .single();

  revalidatePath(`/portal/events/${contract?.event_id}/contracts`);
  return data;
}
