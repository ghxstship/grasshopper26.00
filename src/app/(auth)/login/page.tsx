'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/design-system/components/atoms/input';
import { Label } from '@/design-system/components/atoms/label';
import { AuthCardTemplate } from '@/design-system/components/templates';
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
      router.push('/profile');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'azure') => {
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
    <AuthCardTemplate
      title="Welcome Back"
      description="Sign in to your account to continue"
      onSubmit={handleSubmit}
      submitLabel="Sign In"
      submitLoading={loading}
      showOAuth={true}
      oauthProviders={['google', 'github', 'azure']}
      onOAuthLogin={handleOAuthLogin}
      showMagicLink={true}
      onMagicLink={handleMagicLink}
      magicLinkLoading={loading}
      footerText="Don't have an account?"
      footerLink={{ text: 'Sign up', href: '/signup' }}
    >
      <div className={styles.formField}>
        <Label htmlFor="email">Email</Label>
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
        <div className={styles.labelRow}>
          <Label htmlFor="password">Password</Label>
          <Link href="/reset-password" className={styles.forgotLink}>
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
    </AuthCardTemplate>
  );
}
