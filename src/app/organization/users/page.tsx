'use client';

import { Heading, Text } from '@/design-system';
import { AdminListTemplate } from '@/design-system';
import { Users, Plus } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import styles from './users.module.css';

export default function AdminUsersPage() {
  const { users, stats, loading, searchQuery, setSearchQuery } = useAdminUsers();

  return (
    <AdminListTemplate
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
        icon: <Plus className={styles.icon} />,
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
              <Text>{user.email}</Text>
            </div>
          ))}
        </div>
      )}
    </AdminListTemplate>
  );
}
