'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/design-system/components/atoms/button';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login?reset=true');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen  flex items-center justify-center px-4" style={{ background: 'var(--gradient-hero)' }}>
        <div className="max-w-md w-full bg-black/40 backdrop-blur-lg border-2 border-purple-500/20 rounded-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Password Reset!</h1>
          <p className="text-gray-400 mb-6">
            Your password has been successfully reset. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  flex items-center justify-center px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="max-w-md w-full bg-black/40 backdrop-blur-lg border-2 border-purple-500/20 rounded-lg p-8">
        <div className="text-center mb-8">
          <Lock className="h-16 w-16 text-purple-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold  mb-2 bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-brand-primary)' }}>
            Reset Password
          </h1>
          <p className="text-gray-400">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter new password"
              className="w-full px-4 py-3 bg-black/60 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
              className="w-full px-4 py-3 bg-black/60 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full " style={{ background: 'var(--gradient-brand-primary)' }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <Button
            asChild
            variant="ghost"
            className="w-full text-gray-400 hover:text-white"
          >
            <Link href="/login">Back to Login</Link>
          </Button>
        </form>
      </div>
    </div>
  );
}
