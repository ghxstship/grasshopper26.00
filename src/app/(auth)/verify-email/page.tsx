'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/design-system/components/atoms/Button';
import { Card, CardContent } from '@/design-system/components/atoms/Card';
import { Input } from '@/design-system/components/atoms/Input';
import { Label } from '@/design-system/components/atoms/Label';
import Link from 'next/link';
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
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardContent className={styles.section}>
          {status === 'verifying' && (
            <div className={styles.textCenter}>
              <Loader2 className={styles.loadingIcon} />
              <h1 className={styles.subtitle}>Verifying Email</h1>
              <p className={styles.description}>{message || 'Please wait...'}</p>
            </div>
          )}

          {status === 'success' && (
            <div className={styles.textCenter}>
              <CheckCircle className={styles.successIcon} />
              <h1 className={styles.subtitle}>Email Verified!</h1>
              <p className={styles.bodyText}>{message}</p>
              <Button
                asChild
                className={styles.fullWidth}
              >
                <Link href="/login">Continue to Login</Link>
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className={styles.textCenter}>
              <XCircle className={styles.loadingIcon} />
              <h1 className={styles.subtitle}>Verification Failed</h1>
              <p className={styles.bodyText}>{message}</p>
              <Button
                onClick={() => setStatus('resend')}
                className={styles.fullWidth}
              >
                Resend Verification Email
              </Button>
            </div>
          )}

          {status === 'resend' && (
            <div>
              <div className={`${styles.textCenter} ${styles.section}`}>
                <Mail className={styles.loadingIcon} />
                <h1 className={styles.subtitle}>Resend Verification</h1>
                <p className={styles.description}>{message}</p>
              </div>
              <div className={styles.section}>
                <div className={styles.section}>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <Button
                  onClick={handleResendVerification}
                  className={styles.fullWidth}
                >
                  Send Verification Email
                </Button>
                <Button
                  asChild
                  variant="outlined"
                  className={styles.fullWidth}
                >
                  <Link href="/login">Back to Login</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <Card className={styles.card}>
          <CardContent className={styles.section}>
            <div className={styles.textCenter}>
              <Loader2 className={styles.loadingIcon} />
              <h1 className={styles.subtitle}>Loading...</h1>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
