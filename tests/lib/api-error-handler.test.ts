/**
 * API Error Handler Tests
 * Tests error handling and response formatting
 */

import { describe, it, expect } from 'vitest';
import { handleApiError, ApiError } from '@/lib/api/error-handler';

describe('API Error Handler', () => {
  describe('handleApiError', () => {
    it('should format validation errors', () => {
      const error = new ApiError('Validation failed', 400, {
        fields: ['email', 'password'],
      });

      const response = handleApiError(error);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Validation failed',
        code: 400,
      });
    });

    it('should handle authentication errors', () => {
      const error = new ApiError('Unauthorized', 401);

      const response = handleApiError(error);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should handle forbidden errors', () => {
      const error = new ApiError('Forbidden', 403);

      const response = handleApiError(error);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    it('should handle not found errors', () => {
      const error = new ApiError('Not found', 404);

      const response = handleApiError(error);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not found');
    });

    it('should handle server errors', () => {
      const error = new Error('Internal server error');

      const response = handleApiError(error);

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Internal server error');
    });

    it('should include error details in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new ApiError('Test error', 400, { detail: 'Extra info' });

      const response = handleApiError(error);

      expect(response.body.details).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should sanitize errors in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Sensitive database error');

      const response = handleApiError(error);

      expect(response.body.error).not.toContain('database');
      expect(response.status).toBe(500);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('ApiError class', () => {
    it('should create error with message and status', () => {
      const error = new ApiError('Test error', 400);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ApiError');
    });

    it('should include additional details', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new ApiError('Validation error', 400, details);

      expect(error.details).toEqual(details);
    });

    it('should be instanceof Error', () => {
      const error = new ApiError('Test', 400);

      expect(error instanceof Error).toBe(true);
      expect(error instanceof ApiError).toBe(true);
    });
  });
});
