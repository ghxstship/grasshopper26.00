import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { mfaService } from './mfa.service';
import { accountLockoutService } from './account-lockout.service';

export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginData {
  email: string;
  password: string;
  mfaCode?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuthService {
  private supabase = createClient();

  async register(data: RegisterData): Promise<{ user: User | null; error: Error | null }> {
    try {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (authError) {
        return { user: null, error: authError };
      }

      // Create user profile
      if (authData.user) {
        const { error: profileError } = await this.supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            display_name: data.displayName || data.email.split('@')[0],
            username: data.email.split('@')[0],
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return { user: authData.user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  async login(data: LoginData): Promise<{ user: User | null; error: Error | null; requiresMFA?: boolean }> {
    try {
      // First, attempt to sign in with password
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      // Record failed login attempt
      if (authError) {
        await accountLockoutService.recordLoginAttempt(
          data.email,
          false,
          {
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            failureReason: authError.message,
          }
        );
        return { user: null, error: authError };
      }

      const userId = authData.user?.id;
      if (!userId) {
        return { user: null, error: new Error('User ID not found') };
      }

      // Check if account is locked
      const isLocked = await accountLockoutService.isAccountLocked(userId);
      if (isLocked) {
        await this.supabase.auth.signOut();
        return {
          user: null,
          error: new Error('Account is locked due to too many failed login attempts. Please try again later or contact support.'),
        };
      }

      // Check if MFA is enabled
      const mfaEnabled = await mfaService.isMFAEnabled(userId);
      
      if (mfaEnabled) {
        // If MFA is enabled but no code provided, require MFA
        if (!data.mfaCode) {
          await this.supabase.auth.signOut();
          return {
            user: null,
            error: new Error('MFA code required'),
            requiresMFA: true,
          };
        }

        // Verify MFA code
        const mfaValid = await mfaService.verifyTOTP(userId, data.mfaCode) ||
                         await mfaService.verifyBackupCode(userId, data.mfaCode);
        
        if (!mfaValid) {
          await this.supabase.auth.signOut();
          await accountLockoutService.recordLoginAttempt(
            data.email,
            false,
            {
              userId,
              ipAddress: data.ipAddress,
              userAgent: data.userAgent,
              failureReason: 'Invalid MFA code',
            }
          );
          return {
            user: null,
            error: new Error('Invalid MFA code'),
          };
        }
      }

      // Record successful login
      await accountLockoutService.recordLoginAttempt(
        data.email,
        true,
        {
          userId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        }
      );

      return { user: authData.user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  async logout(): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async verifyEmail(token: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async resendVerificationEmail(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async signInWithOAuth(provider: 'google' | 'github' | 'azure', redirectTo?: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }
}

export const authService = new AuthService();
