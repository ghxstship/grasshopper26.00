/**
 * Comprehensive Supabase Mock Helper
 * Provides consistent mocking across all tests
 */

import { vi } from 'vitest';

export interface MockQueryBuilder {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  neq: ReturnType<typeof vi.fn>;
  gt: ReturnType<typeof vi.fn>;
  gte: ReturnType<typeof vi.fn>;
  lt: ReturnType<typeof vi.fn>;
  lte: ReturnType<typeof vi.fn>;
  like: ReturnType<typeof vi.fn>;
  ilike: ReturnType<typeof vi.fn>;
  is: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  contains: ReturnType<typeof vi.fn>;
  match: ReturnType<typeof vi.fn>;
  not: ReturnType<typeof vi.fn>;
  or: ReturnType<typeof vi.fn>;
  filter: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  then: ReturnType<typeof vi.fn>;
}

export function createMockQueryBuilder(defaultResponse: any = { data: null, error: null }): MockQueryBuilder {
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(defaultResponse),
    maybeSingle: vi.fn().mockResolvedValue(defaultResponse),
    then: vi.fn((resolve) => Promise.resolve(defaultResponse).then(resolve)),
  };

  return builder;
}

export function createMockSupabaseClient(options: {
  queryResponse?: any;
  authUser?: any;
  authSession?: any;
} = {}) {
  const {
    queryResponse = { data: null, error: null },
    authUser = null,
    authSession = null,
  } = options;

  return {
    from: vi.fn(() => createMockQueryBuilder(queryResponse)),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: authUser }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: authSession }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: authUser, session: authSession }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: authUser, session: authSession }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ data: null, error: null }),
      verifyOtp: vi.fn().mockResolvedValue({ data: { user: authUser, session: authSession }, error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: { user: authUser }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/image.jpg' } }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
      })),
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
}

/**
 * Mock Supabase response helper
 */
export function mockSupabaseResponse<T>(data: T, error: any = null) {
  return { data, error };
}

/**
 * Mock Supabase error helper
 */
export function mockSupabaseError(message: string, code: string = 'PGRST116') {
  return {
    data: null,
    error: {
      message,
      details: '',
      hint: '',
      code,
    },
  };
}
