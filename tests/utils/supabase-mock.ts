/**
 * Supabase Mock Utility
 * Provides a properly chainable mock for Supabase queries
 */

import { vi } from 'vitest';

export function createMockQueryBuilder() {
  const builder: any = {
    _mockData: null as any,
    _mockError: null as any,
  };

  // Chainable methods
  const chainableMethods = [
    'select', 'insert', 'update', 'delete',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
    'like', 'ilike', 'is', 'in', 'contains',
    'match', 'not', 'or', 'filter',
    'order', 'limit', 'range',
  ];

  chainableMethods.forEach(method => {
    builder[method] = vi.fn().mockReturnValue(builder);
  });

  // Terminal methods that return promises
  builder.single = vi.fn().mockImplementation(() => {
    return Promise.resolve({ 
      data: builder._mockData, 
      error: builder._mockError 
    });
  });

  builder.maybeSingle = vi.fn().mockImplementation(() => {
    return Promise.resolve({ 
      data: builder._mockData, 
      error: builder._mockError 
    });
  });

  // Make the builder thenable for direct await
  builder.then = vi.fn().mockImplementation((resolve) => {
    return resolve({ 
      data: builder._mockData, 
      error: builder._mockError 
    });
  });

  // Helper to set mock data
  builder.mockResolvedValue = (data: any, error: any = null) => {
    builder._mockData = data;
    builder._mockError = error;
    return builder;
  };

  return builder;
}

export function createMockSupabaseClient() {
  let currentBuilder = createMockQueryBuilder();

  return {
    from: vi.fn().mockImplementation(() => {
      currentBuilder = createMockQueryBuilder();
      return currentBuilder;
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: null, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ data: null, error: null }),
      verifyOtp: vi.fn().mockResolvedValue({ data: null, error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: null, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      }),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ 
          data: { publicUrl: 'https://test.com/image.jpg' } 
        }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    _getCurrentBuilder: () => currentBuilder,
  };
}
