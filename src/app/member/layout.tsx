import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdvanceCartProvider } from '@/contexts/AdvanceCartContext';

/**
 * Member Portal Layout
 * End User/Subscriber Access
 * Tickets, orders, credits, vouchers, referrals, favorites, schedule
 */
export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/member');
  }

  return (
    <AdvanceCartProvider>
      {children}
    </AdvanceCartProvider>
  );
}
