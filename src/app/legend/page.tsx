import { redirect } from 'next/navigation';

/**
 * Legend Root Page
 * Redirects to dashboard
 */
export default function LegendPage() {
  redirect('/legend/dashboard');
}
