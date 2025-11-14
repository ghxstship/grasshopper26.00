import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardClient } from './dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard - GVTEWAY Admin',
  description: 'Organization dashboard',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Mock stats for now
  const stats = {
    totalEvents: 24,
    totalRevenue: 125000,
    totalOrders: 450,
    activeUsers: 1250,
  };

  return <DashboardClient stats={stats} />;
}
