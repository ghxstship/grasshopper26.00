/**
 * Rate Limiter Tests
 * Tests API rate limiting functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit, RateLimitError } from '@/lib/api/rate-limiter';

// Mock Redis
vi.mock('@/lib/cache/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
  },
}));

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow requests under the limit', async () => {
      const { redis } = await import('@/lib/cache/redis');
      vi.mocked(redis.get).mockResolvedValue('5');

      const result = await checkRateLimit('test-key', 10, 60);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should block requests over the limit', async () => {
      const { redis } = await import('@/lib/cache/redis');
      vi.mocked(redis.get).mockResolvedValue('11');

      const result = await checkRateLimit('test-key', 10, 60);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track request count', async () => {
      const { redis } = await import('@/lib/cache/redis');
      vi.mocked(redis.incr).mockResolvedValue(1);

      await checkRateLimit('test-key', 10, 60);

      expect(redis.incr).toHaveBeenCalledWith('test-key');
    });

    it('should set expiration on first request', async () => {
      const { redis } = await import('@/lib/cache/redis');
      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.incr).mockResolvedValue(1);

      await checkRateLimit('test-key', 10, 60);

      expect(redis.expire).toHaveBeenCalledWith('test-key', 60);
    });

    it('should handle different rate limit windows', async () => {
      const { redis } = await import('@/lib/cache/redis');
      vi.mocked(redis.get).mockResolvedValue('1');

      // 1 minute window
      await checkRateLimit('key1', 10, 60);
      expect(redis.expire).toHaveBeenCalledWith('key1', 60);

      // 1 hour window
      await checkRateLimit('key2', 100, 3600);
      expect(redis.expire).toHaveBeenCalledWith('key2', 3600);
    });

    it('should use IP-based keys', async () => {
      const { redis } = await import('@/lib/cache/redis');
      vi.mocked(redis.get).mockResolvedValue('1');

      const ip = '192.168.1.1';
      await checkRateLimit(`ip:${ip}`, 10, 60);

      expect(redis.get).toHaveBeenCalledWith(`ip:${ip}`);
    });

    it('should use user-based keys', async () => {
      const { redis } = await import('@/lib/cache/redis');
      vi.mocked(redis.get).mockResolvedValue('1');

      const userId = 'user-123';
      await checkRateLimit(`user:${userId}`, 10, 60);

      expect(redis.get).toHaveBeenCalledWith(`user:${userId}`);
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error', () => {
      const error = new RateLimitError('Too many requests', 60);

      expect(error.message).toBe('Too many requests');
      expect(error.retryAfter).toBe(60);
      expect(error.name).toBe('RateLimitError');
    });

    it('should be instanceof Error', () => {
      const error = new RateLimitError('Test', 60);

      expect(error instanceof Error).toBe(true);
      expect(error instanceof RateLimitError).toBe(true);
    });
  });
});
