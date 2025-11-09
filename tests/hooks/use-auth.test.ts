/**
 * useAuth Hook Tests
 * Tests authentication state management and user operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/use-auth';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null user when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  it('should return user when authenticated', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' },
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle sign in', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
    };

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: {} },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(async () => {
      if (result.current.signIn) {
        await result.current.signIn('test@example.com', 'password123');
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      }
    });
  });

  it('should handle sign out', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(async () => {
      if (result.current.signOut) {
        await result.current.signOut();
        expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      }
    });
  });

  it('should handle authentication errors', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Authentication failed' },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });
});
