'use client';

import { AdminDetailTemplate } from '@/design-system/components/templates';
import { DollarSign, User, Calendar, CheckCircle } from 'lucide-react';
import { useAdminAdvanceDetail } from '@/hooks/useAdminAdvanceDetail';
import { useParams } from 'next/navigation';

export default function AdminAdvanceDetailPage() {
  const params = useParams();
  const { advance, loading } = useAdminAdvanceDetail(params.id as string);

  return (
    <AdminDetailTemplate
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Advances', href: '/admin/advances' },
        { label: `Advance #${params.id}`, href: `/admin/advances/${params.id}` },
      ]}
      title={`Advance #${advance?.id.slice(0, 8).toUpperCase()}`}
      statusBadge={{ label: advance?.status || 'pending', variant: advance?.status === 'approved' ? 'success' : 'warning' }}
      loading={loading}
      tabs={[
        { key: 'details', label: 'Details', content: <div>Advance details</div> },
        { key: 'history', label: 'History', content: <div>Status history</div> },
      ]}
      metadata={[
        { label: 'User', value: advance?.user_email },
        { label: 'Amount', value: `$${advance?.amount}` },
        { label: 'Requested', value: advance?.created_at },
        { label: 'Status', value: advance?.status },
      ]}
      primaryAction={{ label: 'Approve', onClick: () => {} }}
      secondaryActions={[
        { label: 'Reject', onClick: () => {} },
        { label: 'Request Info', onClick: () => {} },
      ]}
    />
  );
}
