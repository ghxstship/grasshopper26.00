'use client';

import { PortalLayout } from '@/design-system';
import { PortalSidebar } from '@/design-system';
import { Text, Heading } from '@/design-system';
import { StatCard } from '@/design-system';
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
        <Heading level={2} font="bebas">
          Your Vouchers
        </Heading>
        
        {vouchers && vouchers.length > 0 ? (
          <div className={styles.vouchersList}>
            {vouchers.map((voucher: any) => (
              <div key={voucher.id} className={styles.voucherCard}>
                <Heading level={4} font="bebas">{voucher.code}</Heading>
                <Text color="secondary">{voucher.description}</Text>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Ticket className={styles.emptyIcon} />
            <Heading level={3} font="bebas">No vouchers</Heading>
            <Text color="secondary">
              Vouchers will appear here when you receive them
            </Text>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
