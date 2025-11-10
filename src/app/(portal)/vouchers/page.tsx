'use client';

import { PortalLayout } from '@/design-system/components/templates/PortalLayout/PortalLayout';
import { PortalSidebar } from '@/design-system/components/organisms/PortalSidebar/PortalSidebar';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { StatCard } from '@/design-system/components/molecules/StatCard/StatCard';
import { Ticket, Clock, CheckCircle } from 'lucide-react';
import { useVouchers } from '@/hooks/useVouchers';
import styles from './vouchers.module.css';

export default function VouchersPage() {
  const { stats, vouchers, loading } = useVouchers();

  return (
    <PortalLayout
      sidebar={<PortalSidebar />}
      title="Vouchers & Codes"
      description="Manage your promotional codes"
    >
      <div className={styles.statsGrid}>
        <StatCard label="Active Vouchers" value={loading ? '...' : stats.active} icon={<Ticket />} />
        <StatCard label="Used" value={loading ? '...' : stats.used} icon={<CheckCircle />} />
        <StatCard label="Expired" value={loading ? '...' : stats.expired} icon={<Clock />} />
      </div>

      <div className={styles.content}>
        <Typography variant="h3" as="h2">
          Your Vouchers
        </Typography>
        
        {vouchers && vouchers.length > 0 ? (
          <div className={styles.vouchersList}>
            {vouchers.map((voucher: any) => (
              <div key={voucher.id} className={styles.voucherCard}>
                <Typography variant="h4" as="div">{voucher.code}</Typography>
                <Typography variant="body" as="div">{voucher.description}</Typography>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Ticket className={styles.emptyIcon} />
            <Typography variant="h3" as="p">No vouchers</Typography>
            <Typography variant="body" as="p">
              Vouchers will appear here when you receive them
            </Typography>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
