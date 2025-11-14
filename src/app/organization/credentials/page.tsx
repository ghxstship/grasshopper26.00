/**
 * Organization Credentials Page
 * Event credentials and access management
 */

'use client';

import { Heading, Text } from '@/design-system';
import { AdminListTemplate } from '@/design-system';
import { BadgeCheck, CheckCircle, Clock } from 'lucide-react';
import { useAdminCredentials } from '@/hooks/useAdminCredentials';

export default function CredentialsPage() {
  const { credentials, stats, loading, searchQuery, setSearchQuery } = useAdminCredentials();

  return (
    <AdminListTemplate
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
              <Text>{credential.credential_type}</Text>
            </div>
          ))}
        </div>
      )}
    </AdminListTemplate>
  );
}
