import { redirect } from 'next/navigation';

/**
 * Organization Root Page
 * Redirects to dashboard
 */
export default function OrganizationPage() {
  redirect('/organization/dashboard');
}
