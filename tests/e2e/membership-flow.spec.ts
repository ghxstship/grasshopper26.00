/**
 * E2E Test: Membership Subscription Flow
 * Tests the complete membership signup and benefit usage flow
 */

import { test, expect } from '@playwright/test';

test.describe('Membership Subscription Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
  });

  test('should display membership tiers', async ({ page }) => {
    // Navigate to membership page
    await page.goto('/portal/membership');

    // Check for tier cards
    await expect(page.getByText('Extra')).toBeVisible();
    await expect(page.getByText('Main')).toBeVisible();
    await expect(page.getByText('First Class')).toBeVisible();
    await expect(page.getByText('Business')).toBeVisible();
  });

  test('should complete membership signup flow', async ({ page }) => {
    // Skip if not in test environment
    test.skip(process.env.NODE_ENV !== 'test', 'Only run in test environment');

    // Navigate to membership page
    await page.goto('/portal/membership');

    // Select Main tier
    await page.getByRole('button', { name: /select.*main/i }).click();

    // Should redirect to checkout or payment page
    await expect(page).toHaveURL(/checkout|payment/);

    // Fill in payment details (test mode)
    // Note: This would use Stripe test cards in actual E2E tests
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="cardExpiry"]', '12/25');
    await page.fill('[name="cardCvc"]', '123');

    // Submit payment
    await page.getByRole('button', { name: /subscribe|pay/i }).click();

    // Wait for success
    await expect(page.getByText(/success|welcome/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display member benefits after signup', async ({ page }) => {
    test.skip(process.env.NODE_ENV !== 'test', 'Only run in test environment');

    // Assume user is logged in with active membership
    await page.goto('/portal');

    // Check for credit balance
    await expect(page.getByText(/credit/i)).toBeVisible();

    // Check for VIP vouchers
    await expect(page.getByText(/vip.*voucher/i)).toBeVisible();

    // Check for member card
    await expect(page.getByText(/member.*card/i)).toBeVisible();
  });

  test('should allow credit redemption at checkout', async ({ page }) => {
    test.skip(process.env.NODE_ENV !== 'test', 'Only run in test environment');

    // Navigate to event
    await page.goto('/events');
    await page.getByRole('link', { name: /view.*event/i }).first().click();

    // Select tickets
    await page.getByRole('button', { name: /buy.*ticket/i }).click();

    // At checkout, should see credit redemption option
    await expect(page.getByText(/use.*credit/i)).toBeVisible();

    // Apply credits
    await page.getByRole('checkbox', { name: /use.*credit/i }).check();

    // Verify discount applied
    await expect(page.getByText(/credit.*applied/i)).toBeVisible();
  });
});

test.describe('Ticket Purchase Flow', () => {
  test('should complete ticket purchase', async ({ page }) => {
    test.skip(process.env.NODE_ENV !== 'test', 'Only run in test environment');

    // Navigate to events
    await page.goto('/events');

    // Click on first event
    await page.getByRole('link', { name: /view.*event/i }).first().click();

    // Select ticket quantity
    await page.getByRole('spinbutton', { name: /quantity/i }).fill('2');

    // Add to cart or buy now
    await page.getByRole('button', { name: /buy|purchase/i }).click();

    // Fill checkout form
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');

    // Complete payment
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="cardExpiry"]', '12/25');
    await page.fill('[name="cardCvc"]', '123');

    await page.getByRole('button', { name: /complete.*purchase/i }).click();

    // Wait for confirmation
    await expect(page.getByText(/order.*confirmed/i)).toBeVisible({ timeout: 10000 });

    // Should display QR codes
    await expect(page.getByText(/qr.*code/i)).toBeVisible();
  });
});

test.describe('Admin Dashboard', () => {
  test('should display analytics dashboard', async ({ page }) => {
    test.skip(process.env.NODE_ENV !== 'test', 'Only run in test environment');

    // Login as admin
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'admin-password');
    await page.getByRole('button', { name: /sign.*in/i }).click();

    // Navigate to dashboard
    await page.goto('/admin/dashboard');

    // Check for key metrics
    await expect(page.getByText(/total.*revenue/i)).toBeVisible();
    await expect(page.getByText(/tickets.*sold/i)).toBeVisible();
    await expect(page.getByText(/active.*members/i)).toBeVisible();
  });

  test('should allow event creation', async ({ page }) => {
    test.skip(process.env.NODE_ENV !== 'test', 'Only run in test environment');

    // Navigate to admin events
    await page.goto('/admin/events');

    // Click create event
    await page.getByRole('button', { name: /create.*event/i }).click();

    // Fill event form
    await page.fill('[name="title"]', 'Test Event');
    await page.fill('[name="description"]', 'Test Description');
    await page.fill('[name="venue_name"]', 'Test Venue');
    await page.fill('[name="venue_address"]', '123 Test St');
    await page.fill('[name="start_date"]', '2025-12-31T20:00');

    // Save event
    await page.getByRole('button', { name: /save|create/i }).click();

    // Should show success message
    await expect(page.getByText(/event.*created/i)).toBeVisible();
  });
});
