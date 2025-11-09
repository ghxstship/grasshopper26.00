import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateAdvanceRequest } from '@/lib/types/production-advances';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    let query = supabase
      .from('production_advances')
      .select(`
        *,
        items:production_advance_items(*)
      `)
      .eq('submitter_user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: advances, error } = await query;

    if (error) {
      console.error('Error fetching advances:', error);
      return NextResponse.json(
        { error: 'Failed to fetch advances' },
        { status: 500 }
      );
    }

    return NextResponse.json({ advances });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateAdvanceRequest = await request.json();
    const { advance, items, submit } = body;

    // Validate dates
    const startDate = new Date(advance.service_start_date);
    const endDate = new Date(advance.service_end_date);

    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Generate advance number
    const { data: advanceNumberData } = await supabase.rpc('generate_advance_number');
    const advanceNumber = advanceNumberData || `PA-${Date.now()}`;

    // Create advance
    const { data: newAdvance, error: advanceError } = await supabase
      .from('production_advances')
      .insert({
        advance_number: advanceNumber,
        event_id: advance.event_id,
        event_name: advance.event_name,
        company_name: advance.company_name,
        submitter_user_id: user.id,
        point_of_contact_name: advance.contact_name,
        point_of_contact_email: advance.contact_email,
        point_of_contact_phone: advance.contact_phone,
        service_start_date: advance.service_start_date,
        service_end_date: advance.service_end_date,
        purpose: advance.purpose || null,
        special_considerations: advance.special_considerations || null,
        additional_notes: advance.additional_notes || null,
        status: submit ? 'submitted' : 'draft',
        submitted_at: submit ? new Date().toISOString() : null,
        total_items: items.length,
      })
      .select()
      .single();

    if (advanceError) {
      console.error('Error creating advance:', advanceError);
      return NextResponse.json(
        { error: 'Failed to create advance' },
        { status: 500 }
      );
    }

    // Create advance items
    if (items.length > 0) {
      const itemsToInsert = items.map((item, index) => ({
        advance_id: newAdvance.id,
        catalog_item_id: item.catalog_item_id,
        category_name: item.category_name,
        item_name: item.item_name,
        item_description: item.item_description,
        make: item.make,
        model: item.model,
        quantity: item.quantity,
        modifiers: item.modifiers,
        item_notes: item.item_notes,
        display_order: index,
      }));

      const { error: itemsError } = await supabase
        .from('production_advance_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error creating advance items:', itemsError);
        // Rollback: delete the advance
        await supabase
          .from('production_advances')
          .delete()
          .eq('id', newAdvance.id);

        return NextResponse.json(
          { error: 'Failed to create advance items' },
          { status: 500 }
        );
      }
    }

    // Fetch complete advance with items
    const { data: completeAdvance } = await supabase
      .from('production_advances')
      .select(`
        *,
        items:production_advance_items(*)
      `)
      .eq('id', newAdvance.id)
      .single();

    // Send notification email if submitted
    if (submit && completeAdvance) {
      try {
        const { sendAdvanceSubmittedEmail } = await import('@/lib/email/send-advance-emails');
        await sendAdvanceSubmittedEmail(completeAdvance);
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ advance: completeAdvance }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
