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
   * Encrypt sensitive data using AES-256-GCM
   * Uses environment variable for encryption key
   */
  private encryptSecret(data: string): string {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    
    // Get encryption key from environment (must be 32 bytes for AES-256)
    const encryptionKey = process.env.MFA_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('MFA_ENCRYPTION_KEY environment variable not set');
    }
    
    // Ensure key is exactly 32 bytes
    const key = crypto.createHash('sha256').update(encryptionKey).digest();
    
    // Generate random IV (12 bytes for GCM)
    const iv = crypto.randomBytes(12);
    
    // Create cipher
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    // Encrypt data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag
    const authTag = cipher.getAuthTag();
    
    // Combine IV + authTag + encrypted data
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]);
    
    return combined.toString('base64');
  }

  /**
   * Decrypt sensitive data using AES-256-GCM
   */
  private decryptSecret(encrypted: string): string {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    
    // Get encryption key from environment
    const encryptionKey = process.env.MFA_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('MFA_ENCRYPTION_KEY environment variable not set');
    }
    
    // Ensure key is exactly 32 bytes
    const key = crypto.createHash('sha256').update(encryptionKey).digest();
    
    // Decode from base64
    const combined = Buffer.from(encrypted, 'base64');
    
    // Extract IV (first 12 bytes)
    const iv = combined.subarray(0, 12);
    
    // Extract auth tag (next 16 bytes)
    const authTag = combined.subarray(12, 28);
    
    // Extract encrypted data (remaining bytes)
    const encryptedData = combined.subarray(28);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt data
    let decrypted = decipher.update(encryptedData.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

export const mfaService = new MFAService();
