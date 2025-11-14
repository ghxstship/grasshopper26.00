'use client';

import { AdminListTemplate } from '@/design-system';
import { Users, Plus } from 'lucide-react';
import { useAdminArtists } from '@/hooks/useAdminArtists';
import { ArtistsTable } from '@/design-system';

export default function AdminArtistsPage() {
  const { artists, stats, loading, searchQuery, setSearchQuery } = useAdminArtists();

  return (
    <AdminListTemplate
      title="Artists Management"
      subtitle="Manage artist profiles and bookings"
      loading={loading}
      stats={[
        { label: 'Total Artists', value: stats.total },
        { label: 'Active', value: stats.active },
        { label: 'Upcoming Shows', value: stats.upcoming_shows },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search artists..."
      primaryAction={{ label: 'Add Artist', icon: <Plus />, href: '/admin/artists/create' }}
      empty={{
        icon: <Users />,
        title: 'No artists found',
        description: 'Add your first artist to get started',
        action: { label: 'Add Artist', href: '/admin/artists/create' },
      }}
    >
      <ArtistsTable artists={artists} />
    </AdminListTemplate>
  );
}
