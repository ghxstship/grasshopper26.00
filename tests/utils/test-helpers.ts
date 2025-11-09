/**
 * Test Helper Utilities
 * Shared utilities for testing across the application
 */

import { NextRequest } from 'next/server';

/**
 * Create a mock NextRequest for testing API routes
 */
export function createMockNextRequest(
  url: string,
  options: RequestInit & {
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
  } = {}
): NextRequest {
  const { headers = {}, cookies = {}, signal, ...requestOptions } = options;

  const request = new NextRequest(url, {
    ...requestOptions,
    headers: new Headers(headers),
    signal: signal || undefined,
  });

  // Mock cookies
  if (Object.keys(cookies).length > 0) {
    const cookieStore = new Map(Object.entries(cookies));
    Object.defineProperty(request, 'cookies', {
      value: {
        get: (name: string) => cookieStore.get(name),
        getAll: () => Array.from(cookieStore.entries()).map(([name, value]) => ({ name, value })),
        has: (name: string) => cookieStore.has(name),
        set: (name: string, value: string) => cookieStore.set(name, value),
        delete: (name: string) => cookieStore.delete(name),
      },
    });
  }

  return request;
}

/**
 * Mock user session for authenticated requests
 */
export function mockAuthenticatedUser(role: 'user' | 'admin' = 'user') {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    role,
    name: 'Test User',
  };
}

/**
 * Wait for async operations to complete
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate test data for events
 */
export function createMockEvent(overrides = {}) {
  return {
    id: 'event-123',
    title: 'Test Event',
    description: 'Test Description',
    date: '2025-12-31T20:00:00Z',
    venueId: 'venue-123',
    artistIds: ['artist-1'],
    status: 'published',
    ...overrides,
  };
}

/**
 * Generate test data for tickets
 */
export function createMockTicket(overrides = {}) {
  return {
    id: 'ticket-123',
    eventId: 'event-123',
    userId: 'user-123',
    ticketTypeId: 'ticket-type-123',
    qrCode: 'QR123',
    status: 'valid',
    ...overrides,
  };
}

/**
 * Generate test data for orders
 */
export function createMockOrder(overrides = {}) {
  return {
    id: 'order-123',
    userId: 'user-123',
    total: 5000,
    status: 'completed',
    tickets: [createMockTicket()],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
