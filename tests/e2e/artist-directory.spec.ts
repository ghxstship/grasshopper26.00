/**
 * E2E Test: Artist Directory
 */

import { test, expect } from '@playwright/test';

test.describe('Artist Directory', () => {
  test('should display artist directory', async ({ page }) => {
    await page.goto('/artists');

    // Check header
    await expect(page.getByRole('heading', { name: /artists/i })).toBeVisible();

    // Check for search input
    await expect(page.getByPlaceholder(/search artists/i)).toBeVisible();
  });

  test('should filter artists by genre', async ({ page }) => {
    test.skip(process.env.NODE_ENV !== 'test', 'Only run in test environment');

    await page.goto('/artists');

    // Click genre filter
    await page.getByRole('button', { name: /electronic/i }).click();

    // URL should update
    await expect(page).toHaveURL(/genre=Electronic/);
  });

  test('should search artists', async ({ page }) => {
    test.skip(process.env.NODE_ENV !== 'test', 'Only run in test environment');

    await page.goto('/artists');

    // Type in search
    await page.getByPlaceholder(/search artists/i).fill('Test Artist');

    // URL should update
    await expect(page).toHaveURL(/search=Test/);
  });
});

test.describe('Artist Profile', () => {
  test('should display artist profile', async ({ page }) => {
    test.skip(process.env.NODE_ENV !== 'test', 'Only run in test environment');

    await page.goto('/artists/test-artist');

    // Check for artist name
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check for follow button (if logged in)
    // await expect(page.getByRole('button', { name: /follow/i })).toBeVisible();
  });
});
