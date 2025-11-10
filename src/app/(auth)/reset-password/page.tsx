'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthCardTemplate } from '@/design-system/components/templates';
import { Input } from '@/design-system/components/atoms/input';
import { Label } from '@/design-system/components/atoms/label';
import { toast } from 'sonner';
import styles from '../auth.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login?reset=true');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthCardTemplate
        title="Password Reset!"
        description="Your password has been successfully reset. Redirecting to login..."
      >
        <div />
      </AuthCardTemplate>
    );
  }

  return (
    <AuthCardTemplate
      title="Reset Password"
      description="Enter your new password below"
      onSubmit={handleSubmit}
      submitLabel={loading ? 'Resetting...' : 'Reset Password'}
      submitLoading={loading}
      footerText="Remember your password?"
      footerLink={{ text: 'Back to Login', href: '/login' }}
    >
      <div className={styles.formField}>
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter new password"
        />
      </div>
      <div className={styles.formField}>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Confirm new password"
        />
      </div>
      {error && (
        <div className={styles.errorBox}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}
    </AuthCardTemplate>
  );
}
