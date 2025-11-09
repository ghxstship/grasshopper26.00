/**
 * Load Testing with Playwright
 * Tests application performance under load
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Load Tests', () => {
  test('should handle concurrent event page loads', async ({ browser }) => {
    const concurrentUsers = 10;
    const contexts = await Promise.all(
      Array.from({ length: concurrentUsers }, () => browser.newContext())
    );

    const startTime = Date.now();
    
    const pages = await Promise.all(
      contexts.map(async (context) => {
        const page = await context.newPage();
        await page.goto('/events');
        return page;
      })
    );

    const loadTime = Date.now() - startTime;
    
    // All pages should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Verify all pages loaded successfully
    for (const page of pages) {
      await expect(page.locator('h1')).toBeVisible();
    }

    // Cleanup
    await Promise.all(contexts.map(ctx => ctx.close()));
  });

  test('should handle rapid navigation', async ({ page }) => {
    const routes = ['/events', '/artists', '/memberships', '/'];
    const iterations = 5;

    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      for (const route of routes) {
        await page.goto(route);
        await expect(page.locator('body')).toBeVisible();
      }
    }

    const totalTime = Date.now() - startTime;
    const avgTimePerNavigation = totalTime / (iterations * routes.length);

    // Average navigation should be under 500ms
    expect(avgTimePerNavigation).toBeLessThan(500);
  });

  test('should measure checkout flow performance', async ({ page }) => {
    await page.goto('/events/test-event-123');

    // Measure time to complete checkout
    const startTime = Date.now();

    await page.click('[data-testid="buy-tickets"]');
    await page.fill('[data-testid="quantity"]', '2');
    await page.click('[data-testid="continue-checkout"]');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.click('[data-testid="submit-checkout"]');

    const checkoutTime = Date.now() - startTime;

    // Checkout should complete within 3 seconds
    expect(checkoutTime).toBeLessThan(3000);
  });

  test('should measure search performance', async ({ page }) => {
    await page.goto('/events');

    const searchQueries = ['concert', 'festival', 'jazz', 'rock', 'pop'];
    const searchTimes: number[] = [];

    for (const query of searchQueries) {
      const startTime = Date.now();
      
      await page.fill('[data-testid="search-input"]', query);
      await page.waitForSelector('[data-testid="search-results"]');
      
      const searchTime = Date.now() - startTime;
      searchTimes.push(searchTime);
    }

    const avgSearchTime = searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length;

    // Average search should be under 300ms
    expect(avgSearchTime).toBeLessThan(300);
  });

  test('should measure API response times', async ({ request }) => {
    const endpoints = [
      '/api/v1/events',
      '/api/v1/artists',
      '/api/memberships/tiers',
    ];

    const responseTimes: Record<string, number> = {};

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      const response = await request.get(endpoint);
      const responseTime = Date.now() - startTime;

      responseTimes[endpoint] = responseTime;

      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(500);
    }

    console.log('API Response Times:', responseTimes);
  });

  test('should handle large data sets efficiently', async ({ page }) => {
    await page.goto('/events?limit=100');

    const startTime = Date.now();
    await page.waitForSelector('[data-testid="event-card"]');
    const loadTime = Date.now() - startTime;

    // Should load 100 events within 2 seconds
    expect(loadTime).toBeLessThan(2000);

    // Verify scroll performance
    const scrollStartTime = Date.now();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const scrollTime = Date.now() - scrollStartTime;

    // Scrolling should be smooth (under 100ms)
    expect(scrollTime).toBeLessThan(100);
  });

  test('should measure memory usage', async ({ page }) => {
    await page.goto('/events');

    // Get initial memory
    const initialMetrics = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Perform actions that might leak memory
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="event-card"]:first-child');
      await page.goBack();
    }

    // Get final memory
    const finalMetrics = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory growth should be reasonable (less than 50MB)
    const memoryGrowth = (finalMetrics - initialMetrics) / 1024 / 1024;
    expect(memoryGrowth).toBeLessThan(50);
  });
});
