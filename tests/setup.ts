import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.REDIS_URL = 'redis://localhost:6379';

// Mock Next.js cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(() => []),
    has: vi.fn(() => false),
  })),
  headers: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    entries: vi.fn(() => []),
  })),
}));

// Mock Supabase client with proper chain support
vi.mock('@/lib/supabase/server', async () => {
  const { createMockSupabaseClient } = await import('./utils/supabase-mock');
  return {
    createClient: vi.fn(() => createMockSupabaseClient()),
  };
});

// Mock Stripe
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
    },
    customers: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
    paymentIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
  })),
}));

// Mock Redis
vi.mock('@/lib/cache/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    expire: vi.fn(),
  },
  getCached: vi.fn(),
  setCached: vi.fn(),
  invalidateCache: vi.fn(),
}));
