import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '@/design-system/components/organisms/admin/AdminSidebar';
import AdminHeader from '@/design-system/components/organisms/admin/AdminHeader';
import styles from './layout.module.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/admin');
  }

  // Check if user has admin role
  const { data: orgAssignment, error: roleError } = await supabase
    .from('brand_team_assignments')
    .select('team_role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (roleError || !orgAssignment || !['admin', 'super_admin'].includes(orgAssignment.team_role)) {
    redirect('/');
  }

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className={styles.mainContent}>
        {/* Header */}
        <AdminHeader />

        {/* Page content */}
        <main className={styles.pageContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
