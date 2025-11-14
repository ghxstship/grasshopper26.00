/**
 * Login Client - Login page
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, Stack, Heading, Text, Button } from '@/design-system';
import { FormField } from '@/design-system';
import { PageTemplate } from '@/design-system';
import { toast } from 'sonner';
import styles from '../auth.module.css';

export function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        toast.error(signInError.message);
      } else if (data.user) {
        toast.success('Login successful!');
        router.push('/portal');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTemplate showHeader={false} showFooter={false}>
      <div className={styles.authContainer}>
        <Card variant="elevated" padding={8} className={styles.authCard}>
          <Stack gap={6}>
            <Stack gap={2}>
              <Heading level={1} font="anton" align="center">
                Welcome Back
              </Heading>
              <Text align="center" color="secondary">
                Login to your GVTEWAY account
              </Text>
            </Stack>

            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <FormField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  placeholder="your@email.com"
                />

                <FormField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  placeholder="••••••••"
                />

                {error && (
                  <Text size="sm" color="primary">
                    {error}
                  </Text>
                )}

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  Login
                </Button>
              </Stack>
            </form>

            <Stack gap={3}>
              <Text align="center" size="sm" color="tertiary">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className={styles.link}>
                  Sign up
                </Link>
              </Text>

              <Text align="center" size="sm" color="tertiary">
                <Link href="/forgot-password" className={styles.link}>
                  Forgot password?
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Card>
      </div>
    </PageTemplate>
  );
}
