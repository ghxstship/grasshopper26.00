/**
 * Forgot Password Page
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, Stack, Heading, Text, Button } from '@/design-system';
import { FormField } from '@/design-system';
import { PageTemplate } from '@/design-system';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <PageTemplate showHeader={false} showFooter={false}>
        <div className={styles.authContainer}>
          <Card variant="elevated" padding={8} className={styles.authCard}>
            <Stack gap={6}>
              <Stack gap={2}>
                <Heading level={1} font="anton" align="center">
                  Check Your Email
                </Heading>
                <Text align="center" color="secondary">
                  We&apos;ve sent a password reset link to {email}
                </Text>
              </Stack>

              <Text align="center" size="sm" color="tertiary">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </Text>

              <Link href="/login" className={styles.linkNoDecoration}>
                <Button variant="secondary" size="lg" fullWidth>
                  Back to Login
                </Button>
              </Link>
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
                Forgot Password?
              </Heading>
              <Text align="center" color="secondary">
                Enter your email and we&apos;ll send you a reset link
              </Text>
            </Stack>

            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <FormField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  placeholder="your@email.com"
                />

                {error && (
                  <Text size="sm" color="primary">
                    {error}
                  </Text>
                )}

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
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
