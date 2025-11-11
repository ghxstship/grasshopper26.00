'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Contract, ContractStatus } from '@/types/super-expansion';

export async function getContracts(eventId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('contracts')
    .select(`
      *,
      vendor:vendors(vendor_name),
      event:events(event_name)
    `)
    .order('created_at', { ascending: false });

  if (eventId) {
    query = query.eq('event_id', eventId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Contract[];
}

export async function getContract(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      vendor:vendors(*),
      event:events(*),
      deliverables:vendor_deliverables(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createContract(contract: Partial<Contract>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('contracts')
    .insert({
      ...contract,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/contracts');
  if (contract.event_id) {
    revalidatePath(`/portal/events/${contract.event_id}`);
  }
  
  return data;
}

export async function updateContract(id: string, updates: Partial<Contract>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('contracts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/portal/contracts');
  revalidatePath(`/portal/contracts/${id}`);
  
  return data;
}

export async function updateContractStatus(id: string, status: ContractStatus) {
  return updateContract(id, { contract_status: status });
}

export async function signContract(
  id: string,
  signedBy: 'organization' | 'vendor',
  signatoryName: string
) {
  const supabase = await createClient();
  
  const updates = signedBy === 'organization'
    ? {
        signed_by_organization: true,
        organization_signatory: signatoryName,
        organization_signed_at: new Date().toISOString(),
      }
    : {
        signed_by_vendor: true,
        vendor_signatory: signatoryName,
        vendor_signed_at: new Date().toISOString(),
      };

  const { data, error } = await supabase
    .from('contracts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  // Check if both parties have signed
  if (data.signed_by_organization && data.signed_by_vendor) {
    await updateContractStatus(id, 'active');
  }
  
  revalidatePath(`/portal/contracts/${id}`);
  return data;
}

export async function deleteContract(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('contracts')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  revalidatePath('/portal/contracts');
}
