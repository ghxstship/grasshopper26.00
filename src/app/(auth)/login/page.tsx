import { Metadata } from 'next';
import { LoginClient } from './login-client';

export const metadata: Metadata = {
  title: 'Login - GVTEWAY',
  description: 'Login to your GVTEWAY account',
};

export default function LoginPage() {
  return <LoginClient />;
}
