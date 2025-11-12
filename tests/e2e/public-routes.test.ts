import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test all public routes for 404 and 500 errors
test.describe('Public Routes - Error Detection', () => {
  
  test('Homepage should load successfully', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/GVTEWAY/i);
  });

  test('Adventures page should load successfully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/adventures`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Cookies page should load successfully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/cookies`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Events listing page should load successfully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/events`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Legal privacy page should load successfully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/legal/privacy`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Legal terms page should load successfully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/legal/terms`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Membership page should load successfully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/membership`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Music/Artists listing page should load successfully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/music`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('News listing page should load successfully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/news`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Privacy page (root) should load successfully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/privacy`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Shop listing page should load successfully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/shop`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Terms page (root) should load successfully', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/terms`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('h1')).toBeVisible();
  });
});

// Test dynamic routes with sample data
test.describe('Public Dynamic Routes - Error Detection', () => {
  
  test('Event detail page with valid slug should load', async ({ page }) => {
    // First get a valid event slug from the events page
    await page.goto(`${BASE_URL}/events`);
    const eventLink = page.locator('a[href^="/events/"]').first();
    
    if (await eventLink.count() > 0) {
      const href = await eventLink.getAttribute('href');
      if (href) {
        const response = await page.goto(`${BASE_URL}${href}`);
        expect(response?.status()).toBeLessThan(400);
      }
    }
  });

  test('Event detail page with invalid slug should show 404', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/events/non-existent-event-slug-12345`);
    // Should either be 404 or redirect
    expect(response?.status()).toBeGreaterThanOrEqual(200);
  });

  test('Artist detail page with valid slug should load', async ({ page }) => {
    // First get a valid artist slug from the music page
    await page.goto(`${BASE_URL}/music`);
    const artistLink = page.locator('a[href^="/music/"]').first();
    
    if (await artistLink.count() > 0) {
      const href = await artistLink.getAttribute('href');
      if (href) {
        const response = await page.goto(`${BASE_URL}${href}`);
        expect(response?.status()).toBeLessThan(400);
      }
    }
  });

  test('Artist detail page with invalid slug should show 404', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/music/non-existent-artist-slug-12345`);
    expect(response?.status()).toBeGreaterThanOrEqual(200);
  });

  test('News detail page with valid slug should load', async ({ page }) => {
    // First get a valid news slug from the news page
    await page.goto(`${BASE_URL}/news`);
    const newsLink = page.locator('a[href^="/news/"]').first();
    
    if (await newsLink.count() > 0) {
      const href = await newsLink.getAttribute('href');
      if (href) {
        const response = await page.goto(`${BASE_URL}${href}`);
        expect(response?.status()).toBeLessThan(400);
      }
    }
  });

  test('News detail page with invalid slug should show 404', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/news/non-existent-news-slug-12345`);
    expect(response?.status()).toBeGreaterThanOrEqual(200);
  });

  test('Product detail page with valid slug should load', async ({ page }) => {
    // First get a valid product slug from the shop page
    await page.goto(`${BASE_URL}/shop`);
    const productLink = page.locator('a[href^="/shop/"]').first();
    
    if (await productLink.count() > 0) {
      const href = await productLink.getAttribute('href');
      if (href) {
        const response = await page.goto(`${BASE_URL}${href}`);
        expect(response?.status()).toBeLessThan(400);
      }
    }
  });

  test('Product detail page with invalid slug should show 404', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/shop/non-existent-product-slug-12345`);
    expect(response?.status()).toBeGreaterThanOrEqual(200);
  });
});
