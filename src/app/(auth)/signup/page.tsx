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

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    agreeToTerms: false,
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password, name: formData.displayName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast.success(data.message || 'Account created! Please check your email.');
      router.push('/login?registered=true');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: 'google' | 'github' | 'azure') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || `Failed to sign up with ${provider}`);
    }
  };

  return (
    <AuthLayout
      pattern="stripes"
      logo={
        <Typography variant="h1" as="div">
          GVTEWAY
        </Typography>
      }
      footer={
        <div className={styles.footer}>
          <Typography variant="meta" as="span">
            Already have an account?{' '}
            <Link href="/login" className={styles.link}>
              Sign in
            </Link>
          </Typography>
        </div>
      }
    >
      <div className={styles.authContent}>
        <Typography variant="h2" as="h1" className={styles.title}>
          Create Account
        </Typography>
        <Typography variant="body" as="p" className={styles.description}>
          Join the community and never miss an event
        </Typography>

        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.formField}>
            <label htmlFor="displayName" className={styles.label}>
              Display Name
            </label>
            <Input
              id="displayName"
              type="text"
              placeholder="Your name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              required
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
            />
            <Typography variant="meta" as="p">
              Must be at least 8 characters
            </Typography>
          </div>

          <div className={styles.formField}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>

          <div className={styles.labelRow}>
            <input
              type="checkbox"
              id="terms"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
            />
            <label htmlFor="terms" className={styles.footerText}>
              I agree to the{' '}
              <Link href="/legal/terms" className={styles.link}>Terms of Service</Link>{' '}
              and{' '}
              <Link href="/legal/privacy" className={styles.link}>Privacy Policy</Link>
            </label>
          </div>

          <Button
            type="submit"
            variant="filled"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <div className={styles.oauthButtons}>
          <Button
            variant="outlined"
            onClick={() => handleOAuthSignup('google')}
          >
            Google
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleOAuthSignup('github')}
          >
            GitHub
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
