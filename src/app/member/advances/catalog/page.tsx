'use client';

import { PublicBrowseTemplate } from '@/design-system/components/templates';
import { DollarSign } from 'lucide-react';
import { useAdvancesCatalog } from '@/hooks/useAdvancesCatalog';
import { AdvanceCard } from '@/design-system/components/organisms/advances/advance-card';

export default function AdvancesCatalogPage() {
  const { advances, loading, searchQuery, setSearchQuery, sortBy, setSortBy } = useAdvancesCatalog();

  return (
    <PublicBrowseTemplate
      title="ADVANCE CATALOG"
      subtitle="Browse available advance options"
      heroGradient={true}
      searchPlaceholder="Search advances..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      showSearch={true}
      sortOptions={[
        { value: 'amount-asc', label: 'Amount (Low to High)' },
        { value: 'amount-desc', label: 'Amount (High to Low)' },
      ]}
      sortValue={sortBy}
      onSortChange={setSortBy}
      items={advances}
      renderItem={(advance) => <AdvanceCard advance={advance} />}
      gridColumns={3}
      gap="lg"
      loading={loading}
      emptyState={{
        icon: <DollarSign />,
        title: "No advances available",
        description: "Check back later for new options",
      }}
    />
  );
}
