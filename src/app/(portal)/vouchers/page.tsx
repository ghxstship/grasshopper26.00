'use client';

import { PortalDashboardTemplate } from '@/design-system/components/templates';
import { Ticket, Clock, CheckCircle } from 'lucide-react';
import { useVouchers } from '@/hooks/useVouchers';
import { VouchersList } from '@/design-system/components/organisms/vouchers/vouchers-list';

export default function VouchersPage() {
  const { stats, vouchers, loading } = useVouchers();

  return (
    <PortalDashboardTemplate
      greeting="Vouchers & Codes"
      userInfo={<span>Manage your promotional codes</span>}
      statsCards={[
        { label: 'Active Vouchers', value: stats.active, icon: <Ticket /> },
        { label: 'Used', value: stats.used, icon: <CheckCircle /> },
        { label: 'Expired', value: stats.expired, icon: <Clock /> },
      ]}
      sections={[
        {
          id: 'vouchers',
          title: 'Your Vouchers',
          content: <VouchersList vouchers={vouchers} />,
          isEmpty: vouchers.length === 0,
          emptyState: {
            icon: <Ticket />,
            title: 'No vouchers',
            description: 'Vouchers will appear here when you receive them',
          },
        },
      ]}
      layout="single-column"
      loading={loading}
    />
  );
}
