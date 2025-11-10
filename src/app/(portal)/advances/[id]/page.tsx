'use client';

import { AdminDetailTemplate } from '@/design-system/components/templates';
import { DollarSign, Calendar, FileText, CheckCircle } from 'lucide-react';
import { useAdvanceDetail } from '@/hooks/useAdvanceDetail';
import { useParams } from 'next/navigation';

export default function AdvanceDetailPage() {
  const params = useParams();
  const { advance, loading } = useAdvanceDetail(params.id as string);

  return (
    <AdminDetailTemplate
      breadcrumbs={[
        { label: 'Portal', href: '/portal' },
        { label: 'Advances', href: '/advances' },
        { label: `Advance #${params.id}`, href: `/advances/${params.id}` },
      ]}
      title={`Advance Request #${advance?.id.slice(0, 8).toUpperCase()}`}
      statusBadge={{ label: advance?.status || 'pending', variant: advance?.status === 'approved' ? 'success' : 'warning' }}
      loading={loading}
      tabs={[
        { key: 'details', label: 'Details', content: <div>Request details</div> },
        { key: 'documents', label: 'Documents', content: <div>Supporting documents</div> },
      ]}
      metadata={[
        { label: 'Amount', value: `$${advance?.amount}` },
        { label: 'Requested', value: advance?.created_at },
        { label: 'Status', value: advance?.status },
        { label: 'Reference', value: advance?.reference_number },
      ]}
    />
  );
}
