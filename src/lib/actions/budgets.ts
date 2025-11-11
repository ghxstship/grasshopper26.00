'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Budget, BudgetLineItem, BudgetCategory } from '@/types/super-expansion';

export async function getBudgetsByEvent(eventId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Budget[];
}

export async function getBudgetById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      line_items:budget_line_items(
        *,
        category:budget_categories(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getBudgetCategories(organizationId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('budget_categories')
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
  return data as BudgetCategory[];
}

export async function createBudget(eventId: string, organizationId: string, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const budget = {
    event_id: eventId,
    organization_id: organizationId,
    budget_name: formData.get('budget_name') as string,
    budget_version: 1,
    budget_status: 'draft',
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from('budgets')
    .insert(budget)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/portal/events/${eventId}/budget`);
  return data;
}

export async function addBudgetLineItem(budgetId: string, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const lineItem = {
    budget_id: budgetId,
    category_id: formData.get('category_id') as string,
    line_item_name: formData.get('line_item_name') as string,
    description: formData.get('description') as string,
    item_type: formData.get('item_type') as string,
    quantity: parseFloat(formData.get('quantity') as string) || 1,
    unit_cost: parseFloat(formData.get('unit_cost') as string) || 0,
    budgeted_amount: parseFloat(formData.get('budgeted_amount') as string),
    vendor_name: formData.get('vendor_name') as string,
    line_item_status: 'planned',
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from('budget_line_items')
    .insert(lineItem)
    .select()
    .single();

  if (error) throw error;

  // Update budget totals
  await updateBudgetTotals(budgetId);

  revalidatePath(`/portal/budgets/${budgetId}`);
  return data;
}

export async function updateBudgetLineItem(id: string, formData: FormData) {
  const supabase = await createClient();

  const updates = {
    line_item_name: formData.get('line_item_name') as string,
    description: formData.get('description') as string,
    quantity: parseFloat(formData.get('quantity') as string),
    unit_cost: parseFloat(formData.get('unit_cost') as string),
    budgeted_amount: parseFloat(formData.get('budgeted_amount') as string),
    actual_amount: parseFloat(formData.get('actual_amount') as string) || 0,
    line_item_status: formData.get('line_item_status') as string,
    payment_status: formData.get('payment_status') as string,
  };

  const { data, error } = await supabase
    .from('budget_line_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Get budget_id and update totals
  const { data: lineItem } = await supabase
    .from('budget_line_items')
    .select('budget_id')
    .eq('id', id)
    .single();

  if (lineItem) {
    await updateBudgetTotals(lineItem.budget_id);
  }

  revalidatePath(`/portal/budgets/${lineItem?.budget_id}`);
  return data;
}

async function updateBudgetTotals(budgetId: string) {
  const supabase = await createClient();

  const { data: lineItems } = await supabase
    .from('budget_line_items')
    .select('item_type, budgeted_amount, actual_amount')
    .eq('budget_id', budgetId);

  if (!lineItems) return;

  const totals = lineItems.reduce(
    (acc, item) => {
      if (item.item_type === 'revenue') {
        acc.revenue_budgeted += item.budgeted_amount;
        acc.revenue_actual += item.actual_amount;
      } else {
        acc.expenses_budgeted += item.budgeted_amount;
        acc.expenses_actual += item.actual_amount;
      }
      return acc;
    },
    { revenue_budgeted: 0, revenue_actual: 0, expenses_budgeted: 0, expenses_actual: 0 }
  );

  await supabase
    .from('budgets')
    .update({
      total_revenue_budgeted: totals.revenue_budgeted,
      total_revenue_actual: totals.revenue_actual,
      total_expenses_budgeted: totals.expenses_budgeted,
      total_expenses_actual: totals.expenses_actual,
    })
    .eq('id', budgetId);
}

export async function approveBudget(budgetId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('budgets')
    .update({
      budget_status: 'approved',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', budgetId)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/portal/budgets/${budgetId}`);
  return data;
}
