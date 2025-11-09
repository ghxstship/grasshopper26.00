import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'super_admin' && profile.role !== 'system_admin')) {
      return NextResponse.json({ error: 'Forbidden: Super admin access required' }, { status: 403 });
    }

    const { operation, action, ids, emailSubject, emailBody } = await request.json();

    if (!operation || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Handle different operations
    switch (operation) {
      case 'orders':
        await handleOrdersOperation(supabase, action, ids, results);
        break;
      case 'users':
        await handleUsersOperation(supabase, action, ids, results);
        break;
      case 'events':
        await handleEventsOperation(supabase, action, ids, results);
        break;
      case 'emails':
        await handleEmailOperation(supabase, action, ids, emailSubject, emailBody, results);
        break;
      default:
        return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}

async function handleOrdersOperation(
  supabase: any,
  action: string,
  ids: string[],
  results: { success: number; failed: number; errors: string[] }
) {
  for (const id of ids) {
    try {
      switch (action) {
        case 'delete':
          // Soft delete by updating status
          const { error: deleteError } = await supabase
            .from('orders')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', id);
          
          if (deleteError) throw deleteError;
          results.success++;
          break;

        case 'export':
          // Export is handled client-side, just validate IDs exist
          const { data, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();
          
          if (fetchError || !data) throw new Error('Order not found');
          results.success++;
          break;

        case 'update':
          // Update order status to pending for reprocessing
          const { error: updateError } = await supabase
            .from('orders')
            .update({ status: 'pending', updated_at: new Date().toISOString() })
            .eq('id', id);
          
          if (updateError) throw updateError;
          results.success++;
          break;

        default:
          throw new Error('Invalid action');
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Order ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

async function handleUsersOperation(
  supabase: any,
  action: string,
  ids: string[],
  results: { success: number; failed: number; errors: string[] }
) {
  for (const id of ids) {
    try {
      switch (action) {
        case 'delete':
          // Soft delete by deactivating account
          const { error: deleteError } = await supabase
            .from('user_profiles')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', id);
          
          if (deleteError) throw deleteError;
          results.success++;
          break;

        case 'export':
          // Validate user exists
          const { data, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', id)
            .single();
          
          if (fetchError || !data) throw new Error('User not found');
          results.success++;
          break;

        case 'update':
          // Reactivate user account
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ is_active: true, updated_at: new Date().toISOString() })
            .eq('id', id);
          
          if (updateError) throw updateError;
          results.success++;
          break;

        default:
          throw new Error('Invalid action');
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`User ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

async function handleEventsOperation(
  supabase: any,
  action: string,
  ids: string[],
  results: { success: number; failed: number; errors: string[] }
) {
  for (const id of ids) {
    try {
      switch (action) {
        case 'delete':
          // Soft delete by updating status
          const { error: deleteError } = await supabase
            .from('events')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', id);
          
          if (deleteError) throw deleteError;
          results.success++;
          break;

        case 'export':
          // Validate event exists
          const { data, error: fetchError } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();
          
          if (fetchError || !data) throw new Error('Event not found');
          results.success++;
          break;

        case 'update':
          // Publish event
          const { error: updateError } = await supabase
            .from('events')
            .update({ status: 'published', updated_at: new Date().toISOString() })
            .eq('id', id);
          
          if (updateError) throw updateError;
          results.success++;
          break;

        default:
          throw new Error('Invalid action');
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Event ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

async function handleEmailOperation(
  supabase: any,
  action: string,
  ids: string[],
  subject: string,
  body: string,
  results: { success: number; failed: number; errors: string[] }
) {
  if (!subject || !body) {
    results.failed = ids.length;
    results.errors.push('Email subject and body are required');
    return;
  }

  for (const userId of ids) {
    try {
      // Get user email
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (profileError || !profile?.email) {
        throw new Error('User email not found');
      }

      // Create notification record
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'admin_announcement',
          title: subject,
          message: body,
          created_at: new Date().toISOString(),
        });

      if (notificationError) throw notificationError;

      // In production, integrate with email service (Resend, SendGrid, etc.)
      // For now, we're just creating notifications
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(`User ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
