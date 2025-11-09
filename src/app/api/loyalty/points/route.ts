import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';

/**
 * GET /api/loyalty/points
 * Get user's loyalty points balance and history
 */
export async function GET(request: NextRequest) {
  try {
    await rateLimit(request, RateLimitPresets.read);

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's loyalty points
    const { data: loyaltyData, error: loyaltyError } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (loyaltyError && loyaltyError.code !== 'PGRST116') {
      console.error('Error fetching loyalty points:', loyaltyError);
      return NextResponse.json(
        { error: 'Failed to fetch loyalty points' },
        { status: 500 }
      );
    }

    // Get points history
    const { data: history, error: historyError } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (historyError) {
      console.error('Error fetching loyalty history:', historyError);
    }

    return NextResponse.json({
      balance: loyaltyData?.points_balance || 0,
      lifetime_points: loyaltyData?.lifetime_points || 0,
      tier: loyaltyData?.tier || 'bronze',
      history: history || [],
    });
  } catch (error) {
    console.error('Error in GET /api/loyalty/points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/loyalty/points
 * Award or deduct loyalty points (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await rateLimit(request, RateLimitPresets.write);

    const supabase = await createClient();

    // Check authentication and admin role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['super_admin', 'brand_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, points, reason, type } = body;

    // Validate required fields
    if (!user_id || !points || !reason || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, points, reason, type' },
        { status: 400 }
      );
    }

    if (!['earn', 'redeem', 'expire', 'adjustment'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be: earn, redeem, expire, or adjustment' },
        { status: 400 }
      );
    }

    // Get current loyalty data
    const { data: currentLoyalty } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', user_id)
      .single();

    const currentBalance = currentLoyalty?.points_balance || 0;
    const currentLifetime = currentLoyalty?.lifetime_points || 0;

    // Calculate new balance
    let newBalance = currentBalance;
    let newLifetime = currentLifetime;

    if (type === 'earn' || type === 'adjustment') {
      newBalance += points;
      if (type === 'earn') {
        newLifetime += points;
      }
    } else if (type === 'redeem' || type === 'expire') {
      newBalance -= points;
      if (newBalance < 0) {
        return NextResponse.json(
          { error: 'Insufficient points balance' },
          { status: 400 }
        );
      }
    }

    // Update or insert loyalty points
    const { error: upsertError } = await supabase
      .from('loyalty_points')
      .upsert({
        user_id,
        points_balance: newBalance,
        lifetime_points: newLifetime,
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      console.error('Error updating loyalty points:', upsertError);
      return NextResponse.json(
        { error: 'Failed to update loyalty points' },
        { status: 500 }
      );
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('loyalty_transactions')
      .insert({
        user_id,
        points,
        type,
        reason,
        balance_after: newBalance,
        created_by: user.id,
      });

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
    }

    return NextResponse.json({
      success: true,
      new_balance: newBalance,
      lifetime_points: newLifetime,
    });
  } catch (error) {
    console.error('Error in POST /api/loyalty/points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
