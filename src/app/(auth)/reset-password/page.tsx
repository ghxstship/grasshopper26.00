/**
 * Reset Password Page
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, Stack, Heading, Text, Button } from '@/design-system';
import { FormField } from '@/design-system';
import { PageTemplate } from '@/design-system';
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
      <PageTemplate showHeader={false} showFooter={false}>
        <div className={styles.authContainer}>
          <Card variant="elevated" padding={8} className={styles.authCard}>
            <Stack gap={6}>
              <Stack gap={2}>
                <Heading level={1} font="anton" align="center">
                  Password Reset!
                </Heading>
                <Text align="center" color="secondary">
                  Your password has been successfully reset. Redirecting to login...
                </Text>
              </Stack>
            </Stack>
          </Card>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate showHeader={false} showFooter={false}>
      <div className={styles.authContainer}>
        <Card variant="elevated" padding={8} className={styles.authCard}>
          <Stack gap={6}>
            <Stack gap={2}>
              <Heading level={1} font="anton" align="center">
                Reset Password
              </Heading>
              <Text align="center" color="secondary">
                Enter your new password below
              </Text>
            </Stack>

            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <FormField
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  placeholder="Enter new password"
                />

                <FormField
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  fullWidth
                  placeholder="Confirm new password"
                />

                {error && (
                  <Text size="sm" color="primary">
                    {error}
                  </Text>
                )}

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </Stack>
            </form>

            <Stack gap={3}>
              <Text align="center" size="sm" color="tertiary">
                Remember your password?{' '}
                <Link href="/login" className={styles.link}>
                  Back to Login
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Card>
      </div>
    </PageTemplate>
  );
}
