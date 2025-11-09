'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function VerifyEmailPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-black/40 backdrop-blur-lg border-2 border-purple-500/20 rounded-lg p-8">
        {status === 'verifying' && (
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin text-purple-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Verifying Email</h1>
            <p className="text-gray-400">{message || 'Please wait...'}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Link href="/login">Continue to Login</Link>
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <Button
              onClick={() => setStatus('resend')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Resend Verification Email
            </Button>
          </div>
        )}

        {status === 'resend' && (
          <div>
            <div className="text-center mb-6">
              <Mail className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Resend Verification</h1>
              <p className="text-gray-400">{message}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-black/60 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <Button
                onClick={handleResendVerification}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Send Verification Email
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-purple-500/30 hover:bg-purple-500/10"
              >
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
