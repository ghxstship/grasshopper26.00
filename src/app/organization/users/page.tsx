'use client';

import { AdminListTemplate } from '@/design-system/components/templates/AdminListTemplate/AdminListTemplate';
import { AdminSidebar } from '@/design-system/components/organisms/AdminSidebar/AdminSidebar';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Users, Plus } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import styles from './users.module.css';

export default function AdminUsersPage() {
  const { users, stats, loading, searchQuery, setSearchQuery } = useAdminUsers();

  return (
    <AdminListTemplate
      sidebar={<AdminSidebar />}
      title="Users Management"
      description="Manage user accounts and permissions"
      stats={[
        { label: 'Total Users', value: stats.total, icon: <Users /> },
        { label: 'Active', value: stats.active, icon: <Users /> },
        { label: 'Members', value: stats.members, icon: <Users /> },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search users..."
      primaryAction={{
        label: 'Add User',
        icon: <Plus style={{ width: 20, height: 20 }} />,
        href: '/admin/users/create',
      }}
      loading={loading}
      empty={{
        icon: <Users />,
        title: 'No users found',
        description: 'Start by adding your first user',
        action: {
          label: 'Add User',
          href: '/admin/users/create',
        },
      }}
    >
      {users && users.length > 0 && (
        <div className={styles.usersTable}>
          {users.map((user: any) => (
            <div key={user.id} className={styles.userRow}>
              <Typography variant="body" as="div">{user.email}</Typography>
            </div>
          ))}
        </div>
      )}
    </AdminListTemplate>
  );
}
