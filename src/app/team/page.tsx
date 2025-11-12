import { redirect } from 'next/navigation';

/**
 * Team Root Page
 * Redirects to dashboard
 */
export default function TeamPage() {
  redirect('/team/dashboard');
}
