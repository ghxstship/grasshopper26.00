/**
 * Verify Email Page
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { Card, Stack, Heading, Text, Button, Input, Label } from '@/design-system';
import { PageTemplate } from '@/design-system';
import styles from '../auth.module.css';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resend'>('verifying');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (type === 'email_change' || type === 'signup') {
      // Supabase handles verification automatically via magic link
      // Just show success message
      setStatus('success');
      setMessage('Your email has been verified successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 3000);
    } else if (!token) {
      setStatus('resend');
      setMessage('Enter your email to resend verification link');
    }
  }, [searchParams, router]);

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setStatus('verifying');
    setMessage('Sending verification email...');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <PageTemplate showHeader={false} showFooter={false}>
      <div className={styles.authContainer}>
        <Card variant="elevated" padding={8} className={styles.authCard}>
          <Stack gap={6}>
            {status === 'verifying' && (
              <Stack gap={3} align="center">
                <Loader2 size={48} />
                <Heading level={2} font="bebas" align="center">
                  Verifying Email
                </Heading>
                <Text align="center" color="secondary">
                  {message || 'Please wait...'}
                </Text>
              </Stack>
            )}

            {status === 'success' && (
              <Stack gap={4} align="center">
                <CheckCircle size={48} />
                <Heading level={2} font="bebas" align="center">
                  Email Verified!
                </Heading>
                <Text align="center" color="secondary">
                  {message}
                </Text>
                <Link href="/login" className={styles.linkFullWidth}>
                  <Button variant="primary" size="lg" fullWidth>
                    Continue to Login
                  </Button>
                </Link>
              </Stack>
            )}

            {status === 'error' && (
              <Stack gap={4} align="center">
                <XCircle size={48} />
                <Heading level={2} font="bebas" align="center">
                  Verification Failed
                </Heading>
                <Text align="center" color="secondary">
                  {message}
                </Text>
                <Button
                  onClick={() => setStatus('resend')}
                  variant="primary"
                  size="lg"
                  fullWidth
                >
                  Resend Verification Email
                </Button>
              </Stack>
            )}

            {status === 'resend' && (
              <Stack gap={6}>
                <Stack gap={3} align="center">
                  <Mail size={48} />
                  <Heading level={2} font="bebas" align="center">
                    Resend Verification
                  </Heading>
                  <Text align="center" color="secondary">
                    {message}
                  </Text>
                </Stack>

                <Stack gap={4}>
                  <Stack gap={2}>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      fullWidth
                    />
                  </Stack>

                  <Button
                    onClick={handleResendVerification}
                    variant="primary"
                    size="lg"
                    fullWidth
                  >
                    Send Verification Email
                  </Button>

                  <Link href="/login" className={styles.linkFullWidth}>
                    <Button
                      variant="secondary"
                      size="lg"
                      fullWidth
                    >
                      Back to Login
                    </Button>
                  </Link>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Card>
      </div>
    </PageTemplate>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <PageTemplate showHeader={false} showFooter={false}>
          <div className={styles.authContainer}>
            <Card variant="elevated" padding={8} className={styles.authCard}>
              <Stack gap={4} align="center">
                <Loader2 size={48} />
                <Heading level={2} font="bebas" align="center">
                  Loading...
                </Heading>
              </Stack>
            </Card>
          </div>
        </PageTemplate>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
