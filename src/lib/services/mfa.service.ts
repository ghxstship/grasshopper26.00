import { createClient } from '@/lib/supabase/client';
import * as OTPAuth from 'otpauth';
import { randomBytes } from 'crypto';

export interface MFAFactor {
  id: string;
  user_id: string;
  factor_type: 'totp' | 'sms';
  secret?: string;
  phone_number?: string;
  backup_codes?: string[];
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MFASetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export class MFAService {
  private supabase = createClient();

  /**
   * Generate TOTP secret and QR code for MFA setup
   */
  async setupTOTP(userId: string, email: string): Promise<MFASetupResponse> {
    try {
      // Generate secret
      const secret = this.generateSecret();
      
      // Create TOTP instance
      const totp = new OTPAuth.TOTP({
        issuer: 'GVTEWAY',
        label: email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret,
      });

      // Generate QR code URL
      const qrCode = totp.toString();

      // Generate backup codes
      const backupCodes = this.generateBackupCodes(10);

      // Store in database (unverified)
      const { error } = await this.supabase
        .from('user_mfa_factors')
        .insert({
          user_id: userId,
          factor_type: 'totp',
          secret: this.encryptSecret(secret),
          backup_codes: backupCodes.map(code => this.encryptSecret(code)),
          is_verified: false,
          is_active: false,
        });

      if (error) throw error;

      return {
        secret,
        qrCode,
        backupCodes,
      };
    } catch (error) {
      console.error('MFA setup error:', error);
      throw error;
    }
  }

  /**
   * Verify TOTP code and activate MFA
   */
  async verifyTOTP(userId: string, code: string): Promise<boolean> {
    try {
      // Get user's MFA factor
      const { data: factor, error } = await this.supabase
        .from('user_mfa_factors')
        .select('*')
        .eq('user_id', userId)
        .eq('factor_type', 'totp')
        .single();

      if (error || !factor) {
        throw new Error('MFA factor not found');
      }

      // Decrypt secret
      const secret = this.decryptSecret(factor.secret);

      // Create TOTP instance
      const totp = new OTPAuth.TOTP({
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret,
      });

      // Verify code (with 1 period window for clock skew)
      const isValid = totp.validate({ token: code, window: 1 }) !== null;

      if (isValid) {
        // Activate MFA
        await this.supabase
          .from('user_mfa_factors')
          .update({
            is_verified: true,
            is_active: true,
          })
          .eq('id', factor.id);
      }

      return isValid;
    } catch (error) {
      console.error('TOTP verification error:', error);
      return false;
    }
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const { data: factor, error } = await this.supabase
        .from('user_mfa_factors')
        .select('*')
        .eq('user_id', userId)
        .eq('factor_type', 'totp')
        .single();

      if (error || !factor) {
        throw new Error('MFA factor not found');
      }

      // Check if code matches any backup code
      const backupCodes = factor.backup_codes?.map((encrypted: string) =>
        this.decryptSecret(encrypted)
      ) || [];

      const codeIndex = backupCodes.indexOf(code);
      
      if (codeIndex !== -1) {
        // Remove used backup code
        const updatedCodes = [...factor.backup_codes];
        updatedCodes.splice(codeIndex, 1);

        await this.supabase
          .from('user_mfa_factors')
          .update({ backup_codes: updatedCodes })
          .eq('id', factor.id);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Backup code verification error:', error);
      return false;
    }
  }

  /**
   * Check if user has MFA enabled
   */
  async isMFAEnabled(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_mfa_factors')
        .select('is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      return !error && data?.is_active === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Disable MFA for user
   */
  async disableMFA(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('user_mfa_factors')
        .update({ is_active: false })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Disable MFA error:', error);
      throw error;
    }
  }

  /**
   * Get user's MFA factors
   */
  async getMFAFactors(userId: string): Promise<MFAFactor[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_mfa_factors')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get MFA factors error:', error);
      return [];
    }
  }

  /**
   * Generate new backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    try {
      const backupCodes = this.generateBackupCodes(10);

      const { error } = await this.supabase
        .from('user_mfa_factors')
        .update({
          backup_codes: backupCodes.map(code => this.encryptSecret(code)),
        })
        .eq('user_id', userId)
        .eq('factor_type', 'totp');

      if (error) throw error;

      return backupCodes;
    } catch (error) {
      console.error('Regenerate backup codes error:', error);
      throw error;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private generateSecret(): string {
    return new OTPAuth.Secret({ size: 20 }).base32;
  }

  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
    }
    return codes;
  }

  /**
   * Encrypt sensitive data (basic implementation - use proper encryption in production)
   * In production, use a proper encryption library with key management
   */
  private encryptSecret(data: string): string {
    // TODO: Implement proper encryption with AES-256-GCM
    // For now, just base64 encode (NOT SECURE - replace in production)
    return Buffer.from(data).toString('base64');
  }

  /**
   * Decrypt sensitive data
   */
  private decryptSecret(encrypted: string): string {
    // TODO: Implement proper decryption
    // For now, just base64 decode (NOT SECURE - replace in production)
    return Buffer.from(encrypted, 'base64').toString('utf-8');
  }
}

export const mfaService = new MFAService();
