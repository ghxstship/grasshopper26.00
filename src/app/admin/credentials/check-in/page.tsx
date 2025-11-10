'use client';

import { AdminListTemplate } from '@/design-system/components/templates';
import { QrCode, Scan } from 'lucide-react';
import { useCheckIn } from '@/hooks/useCheckIn';
import { CheckInTable } from '@/design-system/components/organisms/credentials/check-in-table';

export default function CheckInPage() {
  const { checkIns, stats, loading } = useCheckIn();

  return (
    <AdminListTemplate
      title="Check-In Management"
      subtitle="Scan and verify event credentials"
      loading={loading}
      stats={[
        { label: 'Total Check-Ins', value: stats.total },
        { label: 'Today', value: stats.today },
        { label: 'Pending', value: stats.pending },
      ]}
      primaryAction={{ label: 'Scan QR Code', icon: <Scan />, href: '/admin/credentials/scan' }}
      empty={{
        icon: <QrCode />,
        title: 'No check-ins',
        description: 'Start scanning credentials',
      }}
    >
      <CheckInTable checkIns={checkIns} />
    </AdminListTemplate>
  );
}
