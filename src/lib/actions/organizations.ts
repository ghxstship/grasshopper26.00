'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Organization, UserOrganization } from '@/types/super-expansion';

export async function getOrganizations() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('is_active', true)
    .order('organization_name');

  if (error) throw error;
  return data as Organization[];
}

export async function getOrganizationById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Organization;
}

export async function getUserOrganizations(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_organizations')
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq('user_id', userId)
    .eq('invitation_status', 'active')
    .order('is_primary_org', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const organization = {
    organization_name: formData.get('organization_name') as string,
    organization_slug: (formData.get('organization_name') as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-'),
    organization_type: formData.get('organization_type') as string,
    primary_email: formData.get('primary_email') as string,
    primary_phone: formData.get('primary_phone') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    country: formData.get('country') as string || 'US',
  };

  const { data: newOrg, error: orgError } = await supabase
    .from('organizations')
    .insert(organization)
    .select()
    .single();

  if (orgError) throw orgError;

  // Add user as organization owner
  const { error: userOrgError } = await supabase
    .from('user_organizations')
    .insert({
      user_id: user.id,
      organization_id: newOrg.id,
      role: 'organization_owner',
      is_primary_org: true,
      invitation_status: 'active',
      joined_at: new Date().toISOString(),
    });

  if (userOrgError) throw userOrgError;

  revalidatePath('/portal/organizations');
  return newOrg;
}

export async function updateOrganization(id: string, formData: FormData) {
  const supabase = await createClient();

  const updates = {
    organization_name: formData.get('organization_name') as string,
    organization_type: formData.get('organization_type') as string,
    primary_email: formData.get('primary_email') as string,
    primary_phone: formData.get('primary_phone') as string,
    website_url: formData.get('website_url') as string,
    address_line1: formData.get('address_line1') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    postal_code: formData.get('postal_code') as string,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/portal/organizations');
  revalidatePath(`/portal/organizations/${id}`);
  return data;
}

export async function inviteUserToOrganization(
  organizationId: string,
  email: string,
  role: string
) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Find user by email
  const { data: invitedUser, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (userError) throw new Error('User not found');

  const { error } = await supabase
    .from('user_organizations')
    .insert({
      user_id: invitedUser.id,
      organization_id: organizationId,
      role,
      invitation_status: 'pending',
      invited_by: user.id,
      invited_at: new Date().toISOString(),
    });

  if (error) throw error;

  revalidatePath(`/portal/organizations/${organizationId}`);
  return { success: true };
}
