import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete ticket purchase flow', async ({ page }) => {
    // Navigate to events page
    await page.goto('/events');
    await expect(page.locator('h1')).toContainText('Events');

    // Select an event
    await page.click('[data-testid="event-card"]:first-child');
    await expect(page.locator('h1')).toBeVisible();

    // Select ticket type
    await page.click('[data-testid="ticket-type"]:first-child');
    await page.fill('[data-testid="quantity-input"]', '2');
    await page.click('[data-testid="add-to-cart"]');

    // Verify cart
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('2');

    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]');
    await expect(page).toHaveURL(/.*checkout/);

    // Fill checkout form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="name"]', 'Test User');

    // Complete payment (test mode)
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');

    // Submit order
    await page.click('[data-testid="submit-order"]');

    // Verify confirmation
    await expect(page).toHaveURL(/.*confirmation/);
    await expect(page.locator('[data-testid="order-confirmed"]')).toBeVisible();
  });

  test('validate form errors', async ({ page }) => {
    await page.goto('/checkout');

    // Submit without filling form
    await page.click('[data-testid="submit-order"]');

    // Check for validation errors
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
  });

  test('handle payment failure', async ({ page }) => {
    await page.goto('/checkout');

    // Fill form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="name"]', 'Test User');

    // Use declined card
    await page.fill('[data-testid="card-number"]', '4000000000000002');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');

    // Submit
    await page.click('[data-testid="submit-order"]');

    // Verify error message
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
  });
});

test.describe('Event Search', () => {
  test('search for events', async ({ page }) => {
    await page.goto('/events');

    // Use search
    await page.fill('[data-testid="search-input"]', 'concert');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Verify results
    await expect(page.locator('[data-testid="event-card"]')).toHaveCount(1, { timeout: 5000 });
  });

  test('filter events by date', async ({ page }) => {
    await page.goto('/events');

    // Apply date filter
    await page.click('[data-testid="date-filter"]');
    await page.click('[data-testid="upcoming-filter"]');

    // Verify filtered results
    await expect(page.locator('[data-testid="event-card"]')).toBeVisible();
  });
});

test.describe('User Profile', () => {
  test('view order history', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Navigate to profile
    await page.goto('/profile');
    await expect(page.locator('h1')).toContainText('My Profile');

    // View orders
    await page.click('[data-testid="orders-tab"]');
    await expect(page.locator('[data-testid="order-item"]')).toBeVisible();
  });

  test('view tickets', async ({ page }) => {
    await page.goto('/profile');
    await page.click('[data-testid="tickets-tab"]');

    // Verify ticket display
    await expect(page.locator('[data-testid="ticket-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="qr-code"]')).toBeVisible();
  });
});
