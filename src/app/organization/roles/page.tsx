'use client';

import { AdminListTemplate } from '@/design-system';
import { Shield, Plus } from 'lucide-react';
import { useAdminRoles } from '@/hooks/useAdminRoles';
import { RolesTable } from '@/design-system';

export default function AdminRolesPage() {
  const { roles, stats, loading } = useAdminRoles();

  return (
    <AdminListTemplate
      title="Roles & Permissions"
      subtitle="Manage user roles and access control"
      loading={loading}
      stats={[
        { label: 'Total Roles', value: stats.total },
        { label: 'Active', value: stats.active },
      ]}
      primaryAction={{ label: 'Create Role', icon: <Plus />, href: '/admin/roles/create' }}
      empty={{
        icon: <Shield />,
        title: 'No roles configured',
        description: 'Create your first role',
      }}
    >
      <RolesTable roles={roles} />
    </AdminListTemplate>
  );
}
