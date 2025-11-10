import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '@/design-system/components/organisms/admin/AdminSidebar';
import AdminHeader from '@/design-system/components/organisms/admin/AdminHeader';
import { AdminBreadcrumbs } from '@/design-system/components/organisms/admin/AdminBreadcrumbs';
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
  const { data: brandUser, error: roleError } = await supabase
    .from('brand_users')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleError || !brandUser || !['admin', 'super_admin'].includes(brandUser.role)) {
    redirect('/');
  }

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className={styles.mainContent}>
        {/* Header */}
        <AdminHeader user={user} />

        {/* Page content */}
        <main className={styles.pageContent}>
          <AdminBreadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
