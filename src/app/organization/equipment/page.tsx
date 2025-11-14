'use client';

import { AdminListTemplate } from '@/design-system';
import { Wrench, Plus } from 'lucide-react';
import { useAdminEquipment } from '@/hooks/useAdminEquipment';
import { EquipmentTable } from '@/design-system';

export default function EquipmentPage() {
  const { equipment, stats, loading, searchQuery, setSearchQuery } = useAdminEquipment();

  return (
    <AdminListTemplate
      title="Equipment Inventory"
      subtitle="Manage production equipment and assets"
      loading={loading}
      stats={[
        { label: 'Total Equipment', value: stats.total },
        { label: 'Available', value: stats.available },
        { label: 'In Use', value: stats.in_use },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search equipment..."
      primaryAction={{ label: 'Add Equipment', icon: <Plus />, href: '/organization/equipment/new' }}
      empty={{
        icon: <Wrench />,
        title: 'No equipment found',
        description: 'Add your first equipment item to get started',
        action: { label: 'Add Equipment', href: '/organization/equipment/new' },
      }}
    >
      <EquipmentTable equipment={equipment} />
    </AdminListTemplate>
  );
}
