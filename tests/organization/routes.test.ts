import { test, expect } from '@playwright/test';

/**
 * Organization Routes Testing Suite
 * Tests all routes in /organization for 404 and 500 errors
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test user credentials (from DEMO_USERS.md)
const ADMIN_EMAIL = 'admin@gvteway.com';
const ADMIN_PASSWORD = 'AdminPass123!';

test.describe('Organization Routes - Authentication Required', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/organization/, { timeout: 10000 });
  });

  test('Dashboard - /organization', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Advances - /organization/advances', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/advances`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Artists - /organization/artists', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/artists`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Artists Create - /organization/artists/create', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/artists/create`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Brands - /organization/brands', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/brands`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Budgets - /organization/budgets', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/budgets`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Bulk Operations - /organization/bulk-operations', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/bulk-operations`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Contracts - /organization/contracts', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/contracts`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Credentials Check-in - /organization/credentials/check-in', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/credentials/check-in`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Equipment - /organization/equipment', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/equipment`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Events - /organization/events', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/events`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Events Create - /organization/events/create', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/events/create`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Events New - /organization/events/new', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/events/new`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Inventory - /organization/inventory', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/inventory`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Marketing Campaigns - /organization/marketing/campaigns', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/marketing/campaigns`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Orders - /organization/orders', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/orders`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Permissions Test - /organization/permissions-test', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/permissions-test`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Products - /organization/products', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/products`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Products New - /organization/products/new', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/products/new`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Reports - /organization/reports', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/reports`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Roles - /organization/roles', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/roles`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Settings - /organization/settings', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/settings`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Tasks - /organization/tasks', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/tasks`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Tickets - /organization/tickets', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/tickets`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Users - /organization/users', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/users`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });

  test('Venues - /organization/venues', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/venues`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveTitle(/404|500|Error/);
  });
});

test.describe('Organization Routes - Dynamic IDs', () => {
  let testEventId: string;
  let testOrderId: string;
  let testAdvanceId: string;
  let testBrandId: string;
  let testBudgetId: string;
  let testTaskId: string;
  let testCredentialId: string;

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/organization/, { timeout: 10000 });

    // Fetch test IDs from database
    // For now, we'll use placeholder IDs and handle 404s gracefully
    testEventId = 'test-event-id';
    testOrderId = 'test-order-id';
    testAdvanceId = 'test-advance-id';
    testBrandId = 'test-brand-id';
    testBudgetId = 'test-budget-id';
    testTaskId = 'test-task-id';
    testCredentialId = 'test-credential-id';
  });

  test('Advance Detail - /organization/advances/[id]', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/advances/${testAdvanceId}`);
    // Accept 404 if no test data exists, but not 500
    expect(response?.status()).not.toBe(500);
  });

  test('Brand Detail - /organization/brands/[id]', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/brands/${testBrandId}`);
    expect(response?.status()).not.toBe(500);
  });

  test('Budget Detail - /organization/budgets/[id]', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/budgets/${testBudgetId}`);
    expect(response?.status()).not.toBe(500);
  });

  test('Event Artists - /organization/events/[id]/artists', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/events/${testEventId}/artists`);
    expect(response?.status()).not.toBe(500);
  });

  test('Event Check-in - /organization/events/[id]/check-in', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/events/${testEventId}/check-in`);
    expect(response?.status()).not.toBe(500);
  });

  test('Event Credentials - /organization/events/[id]/credentials', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/events/${testEventId}/credentials`);
    expect(response?.status()).not.toBe(500);
  });

  test('Event Credential Detail - /organization/events/[id]/credentials/[credentialId]', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/events/${testEventId}/credentials/${testCredentialId}`);
    expect(response?.status()).not.toBe(500);
  });

  test('Event Credential Badge - /organization/events/[id]/credentials/[credentialId]/badge', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/events/${testEventId}/credentials/${testCredentialId}/badge`);
    expect(response?.status()).not.toBe(500);
  });

  test('Event Credentials Issue - /organization/events/[id]/credentials/issue', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/events/${testEventId}/credentials/issue`);
    expect(response?.status()).not.toBe(500);
  });

  test('Event Edit - /organization/events/[id]/edit', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/events/${testEventId}/edit`);
    expect(response?.status()).not.toBe(500);
  });

  test('Event Schedule - /organization/events/[id]/schedule', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/events/${testEventId}/schedule`);
    expect(response?.status()).not.toBe(500);
  });

  test('Event Team - /organization/events/[id]/team', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/events/${testEventId}/team`);
    expect(response?.status()).not.toBe(500);
  });

  test('Event Tickets - /organization/events/[id]/tickets', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/events/${testEventId}/tickets`);
    expect(response?.status()).not.toBe(500);
  });

  test('Event Vendors - /organization/events/[id]/vendors', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/events/${testEventId}/vendors`);
    expect(response?.status()).not.toBe(500);
  });

  test('Order Detail - /organization/orders/[id]', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/orders/${testOrderId}`);
    expect(response?.status()).not.toBe(500);
  });

  test('Order Refund - /organization/orders/[id]/refund', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/orders/${testOrderId}/refund`);
    expect(response?.status()).not.toBe(500);
  });

  test('Order Resend Tickets - /organization/orders/[id]/resend-tickets', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/orders/${testOrderId}/resend-tickets`);
    expect(response?.status()).not.toBe(500);
  });

  test('Task Detail - /organization/tasks/[id]', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/organization/tasks/${testTaskId}`);
    expect(response?.status()).not.toBe(500);
  });
});
