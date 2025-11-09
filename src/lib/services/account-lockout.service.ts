import { createClient } from '@/lib/supabase/client';

export interface LoginAttempt {
  id: string;
  user_id?: string;
  email: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  failure_reason?: string;
  attempted_at: string;
}

export interface AccountLockout {
  id: string;
  user_id: string;
  email: string;
  locked_at: string;
  locked_until: string;
  lock_reason: string;
  failed_attempts: number;
  is_locked: boolean;
  unlocked_at?: string;
  unlocked_by?: string;
}

export class AccountLockoutService {
  private supabase = createClient();
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 30;

  /**
   * Record a login attempt
   */
  async recordLoginAttempt(
    email: string,
    success: boolean,
    options?: {
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
      failureReason?: string;
    }
  ): Promise<void> {
    try {
      // Call the database function to record attempt and handle lockout
      const { error } = await this.supabase.rpc('record_login_attempt', {
        p_user_id: options?.userId || null,
        p_email: email,
        p_ip_address: options?.ipAddress || null,
        p_user_agent: options?.userAgent || null,
        p_success: success,
        p_failure_reason: options?.failureReason || null,
      });

      if (error) {
        console.error('Error recording login attempt:', error);
      }
    } catch (error) {
      console.error('Error recording login attempt:', error);
    }
  }

  /**
   * Check if an account is locked
   */
  async isAccountLocked(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('is_account_locked', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error checking account lock status:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error checking account lock status:', error);
      return false;
    }
  }

  /**
   * Get lockout details for a user
   */
  async getLockoutDetails(userId: string): Promise<AccountLockout | null> {
    try {
      const { data, error } = await this.supabase
        .from('account_lockouts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_locked', true)
        .single();

      if (error || !data) {
        return null;
      }

      return data as AccountLockout;
    } catch (error) {
      console.error('Error getting lockout details:', error);
      return null;
    }
  }

  /**
   * Unlock an account (admin function)
   */
  async unlockAccount(userId: string, unlockedBy: string): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('unlock_account', {
        p_user_id: userId,
        p_unlocked_by: unlockedBy,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error unlocking account:', error);
      throw error;
    }
  }

  /**
   * Get recent login attempts for a user
   */
  async getRecentLoginAttempts(
    userId: string,
    limit: number = 10
  ): Promise<LoginAttempt[]> {
    try {
      const { data, error } = await this.supabase
        .from('login_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('attempted_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting login attempts:', error);
        return [];
      }

      return (data || []) as LoginAttempt[];
    } catch (error) {
      console.error('Error getting login attempts:', error);
      return [];
    }
  }

  /**
   * Get failed login attempts count for an email in the last N minutes
   */
  async getFailedAttemptsCount(
    email: string,
    minutes: number = 15
  ): Promise<number> {
    try {
      const cutoffTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();

      const { count, error } = await this.supabase
        .from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('email', email)
        .eq('success', false)
        .gte('attempted_at', cutoffTime);

      if (error) {
        console.error('Error counting failed attempts:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error counting failed attempts:', error);
      return 0;
    }
  }

  /**
   * Check if IP address is suspicious (too many failed attempts)
   */
  async isSuspiciousIP(ipAddress: string, minutes: number = 60): Promise<boolean> {
    try {
      const cutoffTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();

      const { count, error } = await this.supabase
        .from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ipAddress)
        .eq('success', false)
        .gte('attempted_at', cutoffTime);

      if (error) {
        console.error('Error checking suspicious IP:', error);
        return false;
      }

      // Consider IP suspicious if more than 10 failed attempts in the time window
      return (count || 0) > 10;
    } catch (error) {
      console.error('Error checking suspicious IP:', error);
      return false;
    }
  }

  /**
   * Get all locked accounts (admin function)
   */
  async getAllLockedAccounts(): Promise<AccountLockout[]> {
    try {
      const { data, error } = await this.supabase
        .from('account_lockouts')
        .select('*')
        .eq('is_locked', true)
        .order('locked_at', { ascending: false });

      if (error) {
        console.error('Error getting locked accounts:', error);
        return [];
      }

      return (data || []) as AccountLockout[];
    } catch (error) {
      console.error('Error getting locked accounts:', error);
      return [];
    }
  }

  /**
   * Clear old login attempts (cleanup function)
   */
  async cleanupOldAttempts(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await this.supabase
        .from('login_attempts')
        .delete()
        .lt('attempted_at', cutoffDate);

      if (error) {
        console.error('Error cleaning up old attempts:', error);
      }
    } catch (error) {
      console.error('Error cleaning up old attempts:', error);
    }
  }
}

export const accountLockoutService = new AccountLockoutService();
