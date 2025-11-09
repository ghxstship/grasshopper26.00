import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, RateLimitPresets } from '@/lib/api/rate-limiter';

/**
 * GET /api/loyalty/rewards
 * Get available loyalty rewards
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

    // Get available rewards
    const { data: rewards, error } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .eq('active', true)
      .order('points_required', { ascending: true });

    if (error) {
      console.error('Error fetching rewards:', error);
      return NextResponse.json(
        { error: 'Failed to fetch rewards' },
        { status: 500 }
      );
    }

    // Get user's points balance
    const { data: loyaltyData } = await supabase
      .from('loyalty_points')
      .select('points_balance')
      .eq('user_id', user.id)
      .single();

    const userBalance = loyaltyData?.points_balance || 0;

    // Mark which rewards are affordable
    const rewardsWithAffordability = rewards?.map(reward => ({
      ...reward,
      can_afford: userBalance >= reward.points_required,
    }));

    return NextResponse.json({
      rewards: rewardsWithAffordability,
      user_balance: userBalance,
    });
  } catch (error) {
    console.error('Error in GET /api/loyalty/rewards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/loyalty/rewards
 * Redeem a loyalty reward
 */
export async function POST(request: NextRequest) {
  try {
    await rateLimit(request, RateLimitPresets.write);

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reward_id } = body;

    if (!reward_id) {
      return NextResponse.json(
        { error: 'Missing required field: reward_id' },
        { status: 400 }
      );
    }

    // Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .eq('id', reward_id)
      .eq('active', true)
      .single();

    if (rewardError || !reward) {
      return NextResponse.json(
        { error: 'Reward not found or inactive' },
        { status: 404 }
      );
    }

    // Get user's current points
    const { data: loyaltyData, error: loyaltyError } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (loyaltyError || !loyaltyData) {
      return NextResponse.json(
        { error: 'Loyalty account not found' },
        { status: 404 }
      );
    }

    // Check if user has enough points
    if (loyaltyData.points_balance < reward.points_required) {
      return NextResponse.json(
        { error: 'Insufficient points balance' },
        { status: 400 }
      );
    }

    // Deduct points
    const newBalance = loyaltyData.points_balance - reward.points_required;

    const { error: updateError } = await supabase
      .from('loyalty_points')
      .update({
        points_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating points:', updateError);
      return NextResponse.json(
        { error: 'Failed to redeem reward' },
        { status: 500 }
      );
    }

    // Create redemption record
    const { data: redemption, error: redemptionError } = await supabase
      .from('loyalty_redemptions')
      .insert({
        user_id: user.id,
        reward_id,
        points_spent: reward.points_required,
        status: 'pending',
      })
      .select()
      .single();

    if (redemptionError) {
      console.error('Error creating redemption:', redemptionError);
    }

    // Create transaction record
    await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: user.id,
        points: -reward.points_required,
        type: 'redeem',
        reason: `Redeemed: ${reward.name}`,
        balance_after: newBalance,
        related_id: redemption?.id,
      });

    return NextResponse.json({
      success: true,
      redemption,
      new_balance: newBalance,
    });
  } catch (error) {
    console.error('Error in POST /api/loyalty/rewards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
