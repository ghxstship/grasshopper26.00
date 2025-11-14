'use client';

import { AdminDetailTemplate } from '@/design-system';
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
      statusBadge={<span>{advance?.status || 'pending'}</span>}
      loading={loading}
      tabs={[
        { key: 'details', label: 'Details', content: <div>Request details</div> },
        { key: 'documents', label: 'Documents', content: <div>Supporting documents</div> },
      ]}
      metadata={
        <div>
          <div>Amount: ${advance?.amount}</div>
          <div>Requested: {advance?.created_at}</div>
          <div>Status: {advance?.status}</div>
          <div>Reference: {advance?.reference_number}</div>
        </div>
      }
    >
      <div>Advance details content</div>
    </AdminDetailTemplate>
  );
}
