'use client';

import { AdminDetailTemplate } from '@/design-system';
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
      title={`Advance #${advance?.id?.slice(0, 8).toUpperCase() || 'Loading...'}`}
      statusBadge={<span>{advance?.status || 'pending'}</span>}
      loading={loading}
      metadata={
        <div>
          <div>User: {advance?.user_email}</div>
          <div>Amount: ${advance?.amount}</div>
          <div>Requested: {advance?.created_at}</div>
          <div>Status: {advance?.status}</div>
        </div>
      }
      primaryAction={{ label: 'Approve', onClick: () => {} }}
      secondaryActions={[{ label: 'Reject', onClick: () => {} }]}
    >
      <div>Advance details content</div>
    </AdminDetailTemplate>
  );
}
