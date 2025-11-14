import { Metadata } from 'next';
import { SignupClient } from './signup-client';

export const metadata: Metadata = {
  title: 'Sign Up - GVTEWAY',
  description: 'Create your GVTEWAY account',
};

export default function SignupPage() {
  return <SignupClient />;
}
