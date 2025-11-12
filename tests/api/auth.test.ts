/**
 * Authentication API Route Tests
 * Tests all auth endpoints: login, register, password reset, email verification
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/login/route';
import { POST as RegisterPOST } from '@/app/api/auth/register/route';
import { POST as ResetPasswordPOST } from '@/app/api/auth/reset-password/route';
import { POST as VerifyEmailPOST } from '@/app/api/auth/verify-email/route';
import { GET as GetUserGET } from '@/app/api/auth/user/route';

describe('Authentication API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(200);
    });

    it('should reject invalid credentials', async () => {
      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(401);
    });

    it('should validate email format', async () => {
      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'not-an-email',
          password: 'password123',
        }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(400);
    });

    it('should require password', async () => {
      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register new user with valid data', async () => {
      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          name: 'New User',
        }),
      });

      const response = await RegisterPOST(request as any);
      expect(response.status).toBe(201);
    });

    it('should reject weak passwords', async () => {
      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: '123',
          name: 'New User',
        }),
      });

      const response = await RegisterPOST(request as any);
      expect(response.status).toBe(400);
    });

    it('should reject duplicate email', async () => {
      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'SecurePass123!',
          name: 'Duplicate User',
        }),
      });

      const response = await RegisterPOST(request as any);
      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should send reset email for valid user', async () => {
      const request = new Request('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      });

      const response = await ResetPasswordPOST(request as any);
      expect(response.status).toBe(200);
    });

    it('should not reveal if email exists', async () => {
      const request = new Request('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
        }),
      });

      const response = await ResetPasswordPOST(request as any);
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      const request = new Request('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          token: 'valid-token-123',
        }),
      });

      const response = await VerifyEmailPOST(request as any);
      expect(response.status).toBe(200);
    });

    it('should reject invalid token', async () => {
      const request = new Request('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          token: 'invalid-token',
        }),
      });

      const response = await VerifyEmailPOST(request as any);
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/user', () => {
    it('should return user data when authenticated', async () => {
      const request = new Request('http://localhost:3000/api/auth/user', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer valid-token',
        },
      });

      const response = await GetUserGET();
      expect(response.status).toBe(200);
    });

    it('should return 401 when not authenticated', async () => {
      const request = new Request('http://localhost:3000/api/auth/user', {
        method: 'GET',
      });

      const response = await GetUserGET();
      expect(response.status).toBe(401);
    });
  });
});
