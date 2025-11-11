'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '@/design-system/components/templates/AuthLayout/AuthLayout';
import { Input } from '@/design-system/components/atoms/Input/Input';
import { Button } from '@/design-system/components/atoms/Button/Button';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { toast } from 'sonner';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle email verification needed
        if (data.needsVerification) {
          toast.error(data.error, {
            action: {
              label: 'Resend Email',
              onClick: () => router.push(`/verify-email?email=${encodeURIComponent(email)}`),
            },
          });
        } else {
          toast.error(data.error || 'Login failed');
        }
        return;
      }

      toast.success('Logged in successfully!');
      router.push('/portal');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || `Failed to sign in with ${provider}`);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success('Check your email for the magic link!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      pattern="halftone"
      logo={
        <Typography variant="h1" as="div">
          GVTEWAY
        </Typography>
      }
      footer={
        <div className={styles.footer}>
          <Typography variant="meta" as="span">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className={styles.link}>
              Sign up
            </Link>
          </Typography>
        </div>
      }
    >
      <div className={styles.authContent}>
        <Typography variant="h2" as="h1" className={styles.title}>
          Welcome Back
        </Typography>
        <Typography variant="body" as="p" className={styles.description}>
          Sign in to your account to continue
        </Typography>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formField}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Link href="/reset-password" className={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="filled"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <Button
          variant="outlined"
          fullWidth
          onClick={handleMagicLink}
          disabled={loading}
        >
          Send Magic Link
        </Button>

        <div className={styles.oauthButtons}>
          <Button
            variant="outlined"
            onClick={() => handleOAuthLogin('google')}
          >
            Google
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.href = '/api/auth/bluesky'}
          >
            BlueSky
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
