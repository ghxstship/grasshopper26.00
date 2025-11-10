'use client';

import { AdminListTemplate } from '@/design-system/components/templates';
import { Users, Plus } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { UsersTable } from '@/design-system/components/organisms/admin/users-table';

export default function AdminUsersPage() {
  const { users, stats, loading, searchQuery, setSearchQuery } = useAdminUsers();

  return (
    <AdminListTemplate
      title="Users Management"
      subtitle="Manage user accounts and permissions"
      loading={loading}
      stats={[
        { label: 'Total Users', value: stats.total },
        { label: 'Active', value: stats.active },
        { label: 'Members', value: stats.members },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search users..."
      primaryAction={{ label: 'Add User', icon: <Plus />, href: '/admin/users/create' }}
      empty={{
        icon: <Users />,
        title: 'No users found',
        description: 'Adjust your search',
      }}
    >
      <UsersTable users={users} />
    </AdminListTemplate>
  );
}
