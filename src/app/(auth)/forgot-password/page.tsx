'use client';

import { useState } from 'react';
import { AuthCardTemplate } from '@/design-system/components/templates';
import { Input } from '@/design-system/components/atoms/Input';
import { Label } from '@/design-system/components/atoms/Label';
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
      <AuthCardTemplate
        title="Check Your Email"
        description={`We've sent a password reset link to ${email}`}
        footerText="Click the link in the email to reset your password. The link will expire in 1 hour."
        footerLink={{ text: 'Back to Login', href: '/login' }}
      >
        <div />
      </AuthCardTemplate>
    );
  }

  return (
    <AuthCardTemplate
      title="Forgot Password?"
      description="Enter your email and we'll send you a reset link"
      onSubmit={handleSubmit}
      submitLabel={loading ? 'Sending...' : 'Send Reset Link'}
      submitLoading={loading}
      footerText="Remember your password?"
      footerLink={{ text: 'Back to Login', href: '/login' }}
    >
      <div className={styles.formField}>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
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
