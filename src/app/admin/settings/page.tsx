'use client';

import { AdminLayout } from '@/design-system/components/templates/AdminLayout/AdminLayout';
import { AdminSidebar } from '@/design-system/components/organisms/AdminSidebar/AdminSidebar';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <AdminLayout
      sidebar={<AdminSidebar />}
      title="Admin Settings"
      description="Configure platform settings and preferences"
    >
      <div style={{ padding: 'var(--spacing-6)' }}>
        <Typography variant="h3" as="h2">
          Platform Settings
        </Typography>
        <Typography variant="body" as="p" style={{ marginTop: 'var(--spacing-4)' }}>
          Settings configuration coming soon.
        </Typography>
      </div>
    </AdminLayout>
  );
}
