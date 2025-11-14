/**
 * Signup Client - Registration page
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, Stack, Heading, Text, Button, Checkbox } from '@/design-system';
import { FormField } from '@/design-system';
import { PageTemplate } from '@/design-system';
import { toast } from 'sonner';
import styles from '../auth.module.css';

export function SignupClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      toast.error('You must agree to the terms and conditions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.name,
          },
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        toast.error(signUpError.message);
      } else if (data.user) {
        toast.success('Account created! Please check your email to verify your account.');
        router.push('/verify-email?type=signup');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
      toast.error('Signup failed');
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
                Join GVTEWAY
              </Heading>
              <Text align="center" color="secondary">
                Create your account to get started
              </Text>
            </Stack>

            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <FormField
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  fullWidth
                  placeholder="John Doe"
                />

                <FormField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  fullWidth
                  placeholder="your@email.com"
                />

                <FormField
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  fullWidth
                  placeholder="••••••••"
                />

                <FormField
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  fullWidth
                  placeholder="••••••••"
                />

                <Checkbox
                  label="I agree to the Terms and Conditions"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                />

                {error && (
                  <Text size="sm" color="primary">
                    {error}
                  </Text>
                )}

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  Create Account
                </Button>
              </Stack>
            </form>

            <Stack gap={3}>
              <Text align="center" size="sm" color="tertiary">
                Already have an account?{' '}
                <Link href="/login" className={styles.link}>
                  Login
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Card>
      </div>
    </PageTemplate>
  );
}
