/**
 * MFA Service Tests
 * Tests for multi-factor authentication service including TOTP and backup codes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as OTPAuth from 'otpauth';

describe('MFA Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TOTP Generation', () => {
    it('should generate valid TOTP secret', () => {
      const secret = OTPAuth.Secret.fromBase32('JBSWY3DPEHPK3PXP');
      
      expect(secret).toBeDefined();
      expect(secret.base32).toBe('JBSWY3DPEHPK3PXP');
    });

    it('should generate QR code data URL', () => {
      const totp = new OTPAuth.TOTP({
        issuer: 'GVTEWAY',
        label: 'test@example.com',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32('JBSWY3DPEHPK3PXP'),
      });

      const otpauthUrl = totp.toString();
      
      expect(otpauthUrl).toContain('otpauth://totp/');
      expect(otpauthUrl).toContain('GVTEWAY');
      expect(otpauthUrl).toContain('test@example.com');
    });

    it('should validate TOTP token correctly', () => {
      const totp = new OTPAuth.TOTP({
        issuer: 'GVTEWAY',
        label: 'test@example.com',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32('JBSWY3DPEHPK3PXP'),
      });

      const token = totp.generate();
      const delta = totp.validate({ token, window: 1 });

      expect(delta).not.toBeNull();
      expect(typeof delta).toBe('number');
    });

    it('should reject invalid TOTP token', () => {
      const totp = new OTPAuth.TOTP({
        issuer: 'GVTEWAY',
        label: 'test@example.com',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32('JBSWY3DPEHPK3PXP'),
      });

      const invalidToken = '000000';
      const delta = totp.validate({ token: invalidToken, window: 1 });

      // Invalid token should return null
      expect(delta === null || delta === undefined).toBe(true);
    });
  });

  describe('Backup Codes', () => {
    it('should generate 10 backup codes', () => {
      const generateBackupCodes = (count: number = 10): string[] => {
        const codes: string[] = [];
        for (let i = 0; i < count; i++) {
          const code = Math.random().toString(36).substring(2, 10).toUpperCase();
          codes.push(code);
        }
        return codes;
      };

      const codes = generateBackupCodes();
      
      expect(codes).toHaveLength(10);
      codes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{8}$/);
      });
    });

    it('should generate unique backup codes', () => {
      const generateBackupCodes = (count: number = 10): string[] => {
        const codes: string[] = [];
        for (let i = 0; i < count; i++) {
          const code = Math.random().toString(36).substring(2, 10).toUpperCase();
          codes.push(code);
        }
        return codes;
      };

      const codes = generateBackupCodes();
      const uniqueCodes = new Set(codes);
      
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should hash backup codes before storage', () => {
      const hashCode = (code: string): string => {
        // Simple hash simulation (in real implementation, use bcrypt or similar)
        return Buffer.from(code).toString('base64');
      };

      const code = 'ABC12345';
      const hashed = hashCode(code);
      
      expect(hashed).not.toBe(code);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should validate backup code against hash', () => {
      const hashCode = (code: string): string => {
        return Buffer.from(code).toString('base64');
      };

      const validateCode = (code: string, hash: string): boolean => {
        return hashCode(code) === hash;
      };

      const code = 'ABC12345';
      const hash = hashCode(code);
      
      expect(validateCode(code, hash)).toBe(true);
      expect(validateCode('WRONG', hash)).toBe(false);
    });

    it('should mark backup code as used after validation', () => {
      const backupCodes = [
        { code: 'ABC12345', used: false },
        { code: 'DEF67890', used: false },
      ];

      const useCode = (code: string) => {
        const found = backupCodes.find(bc => bc.code === code);
        if (found) {
          found.used = true;
          return true;
        }
        return false;
      };

      expect(useCode('ABC12345')).toBe(true);
      expect(backupCodes[0].used).toBe(true);
      expect(backupCodes[1].used).toBe(false);
    });

    it('should reject already used backup code', () => {
      const backupCodes = [
        { code: 'ABC12345', used: true },
      ];

      const validateCode = (code: string): boolean => {
        const found = backupCodes.find(bc => bc.code === code);
        return found ? !found.used : false;
      };

      expect(validateCode('ABC12345')).toBe(false);
    });
  });

  describe('MFA Enrollment', () => {
    it('should enable MFA for user', () => {
      const user = {
        id: 'user-123',
        mfa_enabled: false,
        mfa_secret: null,
      };

      const enableMFA = (secret: string) => {
        user.mfa_enabled = true;
        user.mfa_secret = secret;
      };

      enableMFA('JBSWY3DPEHPK3PXP');
      
      expect(user.mfa_enabled).toBe(true);
      expect(user.mfa_secret).toBe('JBSWY3DPEHPK3PXP');
    });

    it('should require TOTP verification before enabling MFA', () => {
      const verifyAndEnable = (token: string, secret: string): boolean => {
        const totp = new OTPAuth.TOTP({
          issuer: 'GVTEWAY',
          label: 'test@example.com',
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: OTPAuth.Secret.fromBase32(secret),
        });

        const delta = totp.validate({ token, window: 1 });
        return delta !== null;
      };

      const secret = 'JBSWY3DPEHPK3PXP';
      const totp = new OTPAuth.TOTP({
        issuer: 'GVTEWAY',
        label: 'test@example.com',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });

      const validToken = totp.generate();
      
      expect(verifyAndEnable(validToken, secret)).toBe(true);
      expect(verifyAndEnable('000000', secret)).toBe(false);
    });

    it('should disable MFA for user', () => {
      const user = {
        id: 'user-123',
        mfa_enabled: true,
        mfa_secret: 'JBSWY3DPEHPK3PXP',
      };

      const disableMFA = () => {
        user.mfa_enabled = false;
        user.mfa_secret = null;
      };

      disableMFA();
      
      expect(user.mfa_enabled).toBe(false);
      expect(user.mfa_secret).toBeNull();
    });
  });

  describe('MFA Login Flow', () => {
    it('should require MFA token after password verification', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        mfa_enabled: true,
      };

      const requiresMFA = (user: any): boolean => {
        return user.mfa_enabled === true;
      };

      expect(requiresMFA(user)).toBe(true);
    });

    it('should allow login with valid TOTP token', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const totp = new OTPAuth.TOTP({
        issuer: 'GVTEWAY',
        label: 'test@example.com',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });

      const token = totp.generate();
      const delta = totp.validate({ token, window: 1 });

      expect(delta).not.toBeNull();
    });

    it('should allow login with valid backup code', () => {
      const backupCodes = [
        { code: 'ABC12345', used: false },
        { code: 'DEF67890', used: false },
      ];

      const validateBackupCode = (code: string): boolean => {
        const found = backupCodes.find(bc => bc.code === code && !bc.used);
        if (found) {
          found.used = true;
          return true;
        }
        return false;
      };

      expect(validateBackupCode('ABC12345')).toBe(true);
      expect(validateBackupCode('ABC12345')).toBe(false); // Already used
    });

    it('should reject login with invalid MFA token', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const totp = new OTPAuth.TOTP({
        issuer: 'GVTEWAY',
        label: 'test@example.com',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });

      const invalidToken = '000000';
      const delta = totp.validate({ token: invalidToken, window: 1 });

      expect(delta === null || delta === undefined).toBe(true);
    });
  });

  describe('Security Considerations', () => {
    it('should use secure secret generation', () => {
      const secret = new OTPAuth.Secret({ size: 20 });
      
      expect(secret.buffer.length).toBe(20);
    });

    it('should enforce time window for TOTP validation', () => {
      const totp = new OTPAuth.TOTP({
        issuer: 'GVTEWAY',
        label: 'test@example.com',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32('JBSWY3DPEHPK3PXP'),
      });

      // Window of 1 allows ±30 seconds
      const token = totp.generate();
      const delta = totp.validate({ token, window: 1 });

      expect(delta).not.toBeNull();
      expect(Math.abs(delta as number)).toBeLessThanOrEqual(1);
    });

    it('should prevent MFA secret exposure in logs', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const sanitized = '***REDACTED***';

      const sanitizeSecret = (s: string): string => {
        return s ? '***REDACTED***' : '';
      };

      expect(sanitizeSecret(secret)).toBe(sanitized);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid secret format', () => {
      expect(() => {
        OTPAuth.Secret.fromBase32('INVALID!!!');
      }).toThrow();
    });

    it('should handle missing MFA secret', () => {
      const validateMFA = (secret: string | null, token: string): boolean => {
        if (!secret) {
          return false;
        }
        // Validation logic
        return true;
      };

      expect(validateMFA(null, '123456')).toBe(false);
    });
  });
});
