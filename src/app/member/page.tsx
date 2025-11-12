import { redirect } from 'next/navigation';

/**
 * Member Root Page
 * Redirects to dashboard
 */
export default function MemberPage() {
  redirect('/member/dashboard');
}
