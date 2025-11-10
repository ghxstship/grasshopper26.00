'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AuthCardTemplate } from '@/design-system/components/templates';
import { Input } from '@/design-system/components/atoms/input';
import { Label } from '@/design-system/components/atoms/label';
import { Checkbox } from '@/design-system/components/atoms/checkbox';
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
    <AuthCardTemplate
      title="Create Account"
      description="Join the community and never miss an event"
      onSubmit={handleSignup}
      submitLabel="Create Account"
      submitLoading={loading}
      showOAuth={true}
      oauthProviders={['google', 'github', 'azure']}
      onOAuthLogin={handleOAuthSignup}
      footerText="Already have an account?"
      footerLink={{ text: 'Sign in', href: '/login' }}
    >
      <div className={styles.formField}>
        <Label htmlFor="displayName">Display Name</Label>
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
        <Label htmlFor="email">Email</Label>
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
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          minLength={8}
        />
        <p className={styles.footerText}>Must be at least 8 characters</p>
      </div>
      <div className={styles.formField}>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />
      </div>
      <div className={styles.labelRow}>
        <Checkbox
          id="terms"
          checked={formData.agreeToTerms}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, agreeToTerms: checked as boolean })
          }
        />
        <label htmlFor="terms" className={styles.footerText}>
          I agree to the{' '}
          <Link href="/terms" className={styles.link}>Terms of Service</Link>{' '}
          and{' '}
          <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
        </label>
      </div>
    </AuthCardTemplate>
  );
}
