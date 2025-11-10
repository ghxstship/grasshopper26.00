/**
 * API Error Handler Tests
 * Tests error handling and response formatting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleAPIError, APIError, ErrorCode } from '@/lib/api/error-handler';

describe('API Error Handler', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      vi.stubEnv('NODE_ENV', originalEnv);
    }
  });

  describe('handleAPIError', () => {
    it('should handle APIError instances', async () => {
      const error = new APIError(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed',
        400,
        { fields: ['email', 'password'] }
      );

      const response = handleAPIError(error);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(data.error.message).toBe('Validation failed');
      expect(data.error.details).toEqual({ fields: ['email', 'password'] });
    });

    it('should handle authentication errors', async () => {
      const error = new APIError(ErrorCode.UNAUTHORIZED, 'Unauthorized', 401);

      const response = handleAPIError(error);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(data.error.message).toBe('Unauthorized');
    });

    it('should handle standard Error instances', async () => {
      const error = new Error('Internal server error');

      const response = handleAPIError(error);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    });

    it('should include error details in development', async () => {
      vi.stubEnv('NODE_ENV', 'development');

      const error = new Error('Test error');

      const response = handleAPIError(error);
      const data = await response.json();

      expect(data.error.message).toBe('Test error');
    });

    it('should sanitize errors in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');

      const error = new Error('Sensitive database error');

      const response = handleAPIError(error);
      const data = await response.json();

      expect(data.error.message).not.toContain('database');
      expect(data.error.message).toBe('An unexpected error occurred');
      expect(response.status).toBe(500);
    });
  });

  describe('APIError class', () => {
    it('should create error with code, message and status', () => {
      const error = new APIError(ErrorCode.VALIDATION_ERROR, 'Test error', 400);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.name).toBe('APIError');
    });

    it('should include additional details', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new APIError(
        ErrorCode.VALIDATION_ERROR,
        'Validation error',
        400,
        details
      );

      expect(error.details).toEqual(details);
    });

    it('should be instanceof Error', () => {
      const error = new APIError(ErrorCode.VALIDATION_ERROR, 'Test', 400);

      expect(error instanceof Error).toBe(true);
      expect(error instanceof APIError).toBe(true);
    });
  });
});
