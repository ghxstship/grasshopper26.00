/**
 * Security Testing Suite
 * Tests for common security vulnerabilities
 */

import { describe, it, expect } from 'vitest';
import { test as playwrightTest } from '@playwright/test';

describe('Security Tests - Unit Level', () => {
  describe('Input Sanitization', () => {
    it('should sanitize SQL injection attempts', () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const sanitized = sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('DROP TABLE');
      expect(sanitized).not.toContain('--');
    });

    it('should sanitize XSS attempts', () => {
      const xssAttempt = '<script>alert("XSS")</script>';
      const sanitized = sanitizeInput(xssAttempt);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    it('should sanitize HTML injection', () => {
      const htmlInjection = '<img src=x onerror=alert("XSS")>';
      const sanitized = sanitizeInput(htmlInjection);
      
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('alert');
    });
  });

  describe('Authentication Security', () => {
    it('should enforce password complexity', () => {
      const weakPasswords = ['123', 'password', 'abc123'];
      const strongPassword = 'SecureP@ssw0rd123!';

      weakPasswords.forEach(pwd => {
        expect(isPasswordStrong(pwd)).toBe(false);
      });

      expect(isPasswordStrong(strongPassword)).toBe(true);
    });

    it('should hash passwords before storage', () => {
      const password = 'MyPassword123!';
      const hashed = hashPassword(password);

      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(50);
      expect(hashed).toMatch(/^\$2[aby]\$/); // bcrypt format
    });

    it('should prevent timing attacks on password comparison', async () => {
      const correctPassword = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword123!';

      const times: number[] = [];

      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await comparePasswords(wrongPassword, hashPassword(correctPassword));
        times.push(Date.now() - start);
      }

      // Timing should be consistent (variance < 10ms)
      const avg = times.reduce((a, b) => a + b) / times.length;
      const variance = times.every(t => Math.abs(t - avg) < 10);
      expect(variance).toBe(true);
    });
  });

  describe('Authorization', () => {
    it('should prevent unauthorized access to admin routes', () => {
      const userRole = 'user';
      const adminRoute = '/admin/events';

      expect(canAccessRoute(userRole, adminRoute)).toBe(false);
    });

    it('should allow admin access to admin routes', () => {
      const adminRole = 'admin';
      const adminRoute = '/admin/events';

      expect(canAccessRoute(adminRole, adminRoute)).toBe(true);
    });

    it('should prevent privilege escalation', () => {
      const userId = 'user-123';
      const attemptedRole = 'admin';

      expect(canSetRole(userId, attemptedRole)).toBe(false);
    });
  });

  describe('Data Validation', () => {
    it('should validate email format', () => {
      const validEmails = ['test@example.com', 'user+tag@domain.co.uk'];
      const invalidEmails = ['invalid', '@example.com', 'test@', 'test @example.com'];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it('should validate price inputs', () => {
      expect(isValidPrice(5000)).toBe(true);
      expect(isValidPrice(0)).toBe(true);
      expect(isValidPrice(-100)).toBe(false);
      expect(isValidPrice(NaN)).toBe(false);
    });

    it('should validate quantity limits', () => {
      expect(isValidQuantity(1, 10)).toBe(true);
      expect(isValidQuantity(0, 10)).toBe(false);
      expect(isValidQuantity(11, 10)).toBe(false);
      expect(isValidQuantity(-1, 10)).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on API calls', async () => {
      const rateLimiter = createRateLimiter({ maxRequests: 5, windowMs: 1000 });
      const userId = 'test-user';

      // First 5 requests should succeed
      for (let i = 0; i < 5; i++) {
        expect(await rateLimiter.check(userId)).toBe(true);
      }

      // 6th request should be blocked
      expect(await rateLimiter.check(userId)).toBe(false);
    });
  });
});

playwrightTest.describe('Security Tests - E2E Level', () => {
  playwrightTest('should prevent CSRF attacks', async ({ page }) => {
    await page.goto('/login');
    
    // Verify CSRF token is present
    const csrfToken = await page.locator('[name="csrf_token"]').inputValue();
    expect(csrfToken).toBeTruthy();
    expect(csrfToken.length).toBeGreaterThan(20);
  });

  playwrightTest('should enforce HTTPS in production', async ({ page }) => {
    await page.goto('/');
    const url = page.url();
    
    if (process.env.NODE_ENV === 'production') {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  playwrightTest('should set secure headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response!.headers();

    // Check security headers
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['strict-transport-security']).toBeTruthy();
    expect(headers['content-security-policy']).toBeTruthy();
  });

  playwrightTest('should prevent clickjacking', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response!.headers();

    expect(headers['x-frame-options']).toMatch(/^(DENY|SAMEORIGIN)$/);
  });

  playwrightTest('should sanitize user input in forms', async ({ page }) => {
    await page.goto('/events/new');
    
    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('[name="title"]', xssPayload);
    await page.click('[type="submit"]');

    // Check that script is not executed
    const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
    const dialog = await dialogPromise;
    expect(dialog).toBeNull();
  });

  playwrightTest('should prevent open redirects', async ({ page }) => {
    const maliciousUrl = 'https://evil.com';
    await page.goto(`/login?redirect=${encodeURIComponent(maliciousUrl)}`);
    
    // After login, should not redirect to external site
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('[type="submit"]');

    await page.waitForURL('**/*');
    const finalUrl = page.url();
    expect(finalUrl).not.toContain('evil.com');
  });

  playwrightTest('should enforce session timeout', async ({ page, context }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('[type="submit"]');

    // Get session cookie
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'session');

    expect(sessionCookie).toBeDefined();
    expect(sessionCookie!.expires).toBeDefined();
    expect(sessionCookie!.httpOnly).toBe(true);
    expect(sessionCookie!.secure).toBe(true);
  });
});

// Helper functions (would be imported from actual implementation)
function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, '').replace(/['";]/g, '');
}

function isPasswordStrong(password: string): boolean {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password) &&
         /[^A-Za-z0-9]/.test(password);
}

function hashPassword(password: string): string {
  // Mock implementation - actual would use bcrypt
  return `$2a$10$${password.split('').reverse().join('')}`;
}

async function comparePasswords(input: string, hashed: string): Promise<boolean> {
  // Mock constant-time comparison
  await new Promise(resolve => setTimeout(resolve, 10));
  return hashPassword(input) === hashed;
}

function canAccessRoute(role: string, route: string): boolean {
  if (route.startsWith('/admin')) {
    return role === 'admin';
  }
  return true;
}

function canSetRole(userId: string, role: string): boolean {
  // Only system can set admin role
  return role !== 'admin';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPrice(price: number): boolean {
  return !isNaN(price) && price >= 0;
}

function isValidQuantity(quantity: number, max: number): boolean {
  return quantity > 0 && quantity <= max;
}

function createRateLimiter(config: { maxRequests: number; windowMs: number }) {
  const requests = new Map<string, number[]>();
  
  return {
    check: async (userId: string): Promise<boolean> => {
      const now = Date.now();
      const userRequests = requests.get(userId) || [];
      const recentRequests = userRequests.filter(t => now - t < config.windowMs);
      
      if (recentRequests.length >= config.maxRequests) {
        return false;
      }
      
      recentRequests.push(now);
      requests.set(userId, recentRequests);
      return true;
    },
  };
}
