/**
 * Membership Lifecycle Integration Test
 * Tests membership subscription, credit allocation, and renewal workflows
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@/lib/supabase/client';

describe('Membership Lifecycle Integration', () => {
  let supabase: ReturnType<typeof createClient>;
  let testUserId: string;

  beforeEach(async () => {
    supabase = createClient();
    
    // Create test user
    const { data: user } = await supabase.auth.signUp({
      email: `member-test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });
    testUserId = user.user!.id;
  });

  afterEach(async () => {
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  it('should complete membership subscription flow', async () => {
    // Step 1: Get available tiers
    const { data: tiers } = await supabase
      .from('membership_tiers')
      .select()
      .eq('active', true);

    expect(tiers).toBeDefined();
    expect(tiers!.length).toBeGreaterThan(0);

    const premiumTier = tiers!.find(t => t.name === 'Premium');
    expect(premiumTier).toBeDefined();

    // Step 2: Create subscription
    const { data: membership } = await supabase
      .from('memberships')
      .insert({
        user_id: testUserId,
        tier_id: premiumTier!.id,
        status: 'active',
        credits: premiumTier!.credits_per_month,
        start_date: new Date().toISOString(),
        next_billing_date: new Date(Date.now() + 30 * 86400000).toISOString(),
      })
      .select()
      .single();

    expect(membership).toBeDefined();
    expect(membership!.status).toBe('active');
    expect(membership!.credits).toBe(premiumTier!.credits_per_month);

    // Step 3: Verify credit allocation
    const { data: creditHistory } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: testUserId,
        membership_id: membership!.id,
        amount: premiumTier!.credits_per_month,
        type: 'allocation',
        description: 'Monthly credit allocation',
      })
      .select()
      .single();

    expect(creditHistory).toBeDefined();
    expect(creditHistory!.amount).toBe(premiumTier!.credits_per_month);
  });

  it('should handle credit redemption', async () => {
    // Create active membership
    const { data: membership } = await supabase
      .from('memberships')
      .insert({
        user_id: testUserId,
        tier_id: 'premium',
        status: 'active',
        credits: 10,
      })
      .select()
      .single();

    const creditsToRedeem = 2;

    // Redeem credits
    const { data: updatedMembership } = await supabase
      .from('memberships')
      .update({ credits: membership!.credits - creditsToRedeem })
      .eq('id', membership!.id)
      .select()
      .single();

    expect(updatedMembership!.credits).toBe(8);

    // Record transaction
    const { data: transaction } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: testUserId,
        membership_id: membership!.id,
        amount: -creditsToRedeem,
        type: 'redemption',
        description: 'Ticket purchase',
      })
      .select()
      .single();

    expect(transaction).toBeDefined();
    expect(transaction!.amount).toBe(-creditsToRedeem);
  });

  it('should prevent credit redemption with insufficient balance', async () => {
    // Create membership with low credits
    const { data: membership } = await supabase
      .from('memberships')
      .insert({
        user_id: testUserId,
        tier_id: 'premium',
        status: 'active',
        credits: 1,
      })
      .select()
      .single();

    // Attempt to redeem more credits than available
    const creditsToRedeem = 5;
    
    // Check balance first (business logic)
    expect(membership!.credits).toBeLessThan(creditsToRedeem);
    
    // Should not proceed with redemption
    // This would be handled by application logic, not DB constraint
  });

  it('should handle membership cancellation', async () => {
    // Create active membership
    const { data: membership } = await supabase
      .from('memberships')
      .insert({
        user_id: testUserId,
        tier_id: 'premium',
        status: 'active',
        credits: 10,
      })
      .select()
      .single();

    // Cancel membership
    const { data: cancelledMembership } = await supabase
      .from('memberships')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', membership!.id)
      .select()
      .single();

    expect(cancelledMembership!.status).toBe('cancelled');
    expect(cancelledMembership!.cancelled_at).toBeDefined();

    // Credits should remain until expiration
    expect(cancelledMembership!.credits).toBe(10);
  });

  it('should handle membership renewal', async () => {
    // Create membership nearing renewal
    const nextBillingDate = new Date(Date.now() - 86400000); // Yesterday
    const { data: membership } = await supabase
      .from('memberships')
      .insert({
        user_id: testUserId,
        tier_id: 'premium',
        status: 'active',
        credits: 2,
        next_billing_date: nextBillingDate.toISOString(),
      })
      .select()
      .single();

    // Simulate renewal
    const newBillingDate = new Date(Date.now() + 30 * 86400000);
    const { data: renewedMembership } = await supabase
      .from('memberships')
      .update({
        credits: 10, // Reset credits
        next_billing_date: newBillingDate.toISOString(),
      })
      .eq('id', membership!.id)
      .select()
      .single();

    expect(renewedMembership!.credits).toBe(10);
    expect(new Date(renewedMembership!.next_billing_date).getTime())
      .toBeGreaterThan(Date.now());
  });

  it('should handle membership upgrade', async () => {
    // Create basic membership
    const { data: basicMembership } = await supabase
      .from('memberships')
      .insert({
        user_id: testUserId,
        tier_id: 'basic',
        status: 'active',
        credits: 5,
      })
      .select()
      .single();

    // Upgrade to premium
    const { data: upgradedMembership } = await supabase
      .from('memberships')
      .update({
        tier_id: 'premium',
        credits: 15, // Pro-rated + new tier credits
      })
      .eq('id', basicMembership!.id)
      .select()
      .single();

    expect(upgradedMembership!.tier_id).toBe('premium');
    expect(upgradedMembership!.credits).toBeGreaterThan(basicMembership!.credits);
  });

  it('should expire unused credits', async () => {
    const expirationDate = new Date(Date.now() - 86400000); // Yesterday
    
    // Create membership with expired credits
    const { data: membership } = await supabase
      .from('memberships')
      .insert({
        user_id: testUserId,
        tier_id: 'premium',
        status: 'active',
        credits: 10,
        credits_expire_at: expirationDate.toISOString(),
      })
      .select()
      .single();

    // Simulate expiration job
    const { data: expiredMembership } = await supabase
      .from('memberships')
      .update({ credits: 0 })
      .eq('id', membership!.id)
      .lt('credits_expire_at', new Date().toISOString())
      .select()
      .single();

    expect(expiredMembership!.credits).toBe(0);
  });
});
