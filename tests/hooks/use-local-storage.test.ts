/**
 * useLocalStorage Hook Tests
 * Tests local storage state management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/use-local-storage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return initial value when no stored value exists', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial-value')
    );

    expect(result.current[0]).toBe('initial-value');
  });

  it('should return stored value if it exists', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial-value')
    );

    expect(result.current[0]).toBe('stored-value');
  });

  it('should update stored value when setValue is called', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial-value')
    );

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
  });

  it('should handle function updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });

  it('should handle complex objects', () => {
    const initialObject = { name: 'Test', count: 0 };
    const { result } = renderHook(() =>
      useLocalStorage('object-key', initialObject)
    );

    expect(result.current[0]).toEqual(initialObject);

    const updatedObject = { name: 'Updated', count: 5 };
    act(() => {
      result.current[1](updatedObject);
    });

    expect(result.current[0]).toEqual(updatedObject);
    expect(JSON.parse(localStorage.getItem('object-key') || '{}')).toEqual(
      updatedObject
    );
  });

  it('should handle arrays', () => {
    const { result } = renderHook(() =>
      useLocalStorage<number[]>('array-key', [1, 2, 3])
    );

    expect(result.current[0]).toEqual([1, 2, 3]);

    act(() => {
      result.current[1]([4, 5, 6]);
    });

    expect(result.current[0]).toEqual([4, 5, 6]);
  });

  it('should handle invalid JSON gracefully', () => {
    localStorage.setItem('test-key', 'invalid-json{');

    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'fallback')
    );

    expect(result.current[0]).toBe('fallback');
  });

  it('should sync across multiple instances', () => {
    const { result: result1 } = renderHook(() =>
      useLocalStorage('shared-key', 'initial')
    );
    const { result: result2 } = renderHook(() =>
      useLocalStorage('shared-key', 'initial')
    );

    act(() => {
      result1.current[1]('updated');
    });

    // Both should have the updated value
    expect(result1.current[0]).toBe('updated');
    expect(result2.current[0]).toBe('updated');
  });
});
