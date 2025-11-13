/**
 * Organization Credentials Page
 * Event credentials and access management
 */

'use client';

import { AdminListTemplate } from '@/design-system/components/templates/AdminListTemplate/AdminListTemplate';
import { AdminSidebar } from '@/design-system/components/organisms/AdminSidebar/AdminSidebar';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { BadgeCheck, CheckCircle, Clock } from 'lucide-react';
import { useAdminCredentials } from '@/hooks/useAdminCredentials';

export default function CredentialsPage() {
  const { credentials, stats, loading, searchQuery, setSearchQuery } = useAdminCredentials();

  return (
    <AdminListTemplate
      sidebar={<AdminSidebar />}
      title="Event Credentials"
      description="Manage event credentials and access passes"
      stats={[
        { label: 'Total Credentials', value: stats.total, icon: <BadgeCheck /> },
        { label: 'Active', value: stats.active, icon: <CheckCircle /> },
        { label: 'Pending', value: stats.pending, icon: <Clock /> },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search credentials..."
      loading={loading}
      empty={{
        icon: <BadgeCheck />,
        title: 'No credentials yet',
        description: 'Event credentials will appear here when created',
      }}
    >
      {credentials && credentials.length > 0 && (
        <div>
          {credentials.map((credential) => (
            <div key={credential.id}>
              <Typography variant="body">{credential.credential_type}</Typography>
            </div>
          ))}
        </div>
      )}
    </AdminListTemplate>
  );
}
