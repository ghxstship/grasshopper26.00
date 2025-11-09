/**
 * useDebounce Hook Tests
 * Tests debouncing functionality for input handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '@/hooks/use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should cancel previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'first', delay: 500 },
      }
    );

    rerender({ value: 'second', delay: 500 });
    vi.advanceTimersByTime(250);

    rerender({ value: 'third', delay: 500 });
    vi.advanceTimersByTime(250);

    // Should still be initial value
    expect(result.current).toBe('first');

    vi.advanceTimersByTime(250);

    await waitFor(() => {
      expect(result.current).toBe('third');
    });
  });

  it('should handle different delay values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'test', delay: 1000 },
      }
    );

    rerender({ value: 'updated', delay: 1000 });
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should work with non-string values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 123, delay: 500 },
      }
    );

    expect(result.current).toBe(123);

    rerender({ value: 456, delay: 500 });
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(result.current).toBe(456);
    });
  });
});
