'use client';

import { PortalLayout } from '@/design-system/components/templates/PortalLayout/PortalLayout';
import { PortalSidebar } from '@/design-system/components/organisms/PortalSidebar/PortalSidebar';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { StatCard } from '@/design-system/components/molecules/StatCard/StatCard';
import { Coins, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import styles from './credits.module.css';

export default function CreditsPage() {
  const { stats, credits, loading } = useCredits();

  return (
    <PortalLayout
      sidebar={<PortalSidebar />}
      title="Ticket Credits"
      description="Manage your membership credits"
    >
      <div className={styles.statsGrid}>
        <StatCard label="Available Credits" value={loading ? '...' : stats.available_credits} icon={<Coins />} />
        <StatCard label="Total Earned" value={loading ? '...' : stats.total_credits} icon={<TrendingUp />} />
        <StatCard label="Expiring Soon" value={loading ? '...' : stats.expiring_soon} icon={<AlertCircle />} />
        <StatCard label="Expired" value={loading ? '...' : stats.expired_credits} icon={<Clock />} />
      </div>

      <div className={styles.content}>
        <Typography variant="h3" as="h2">
          Credit History
        </Typography>
        
        {credits && credits.length > 0 ? (
          <div className={styles.creditsList}>
            {credits.map((credit: any) => (
              <div key={credit.id} className={styles.creditItem}>
                <Typography variant="body" as="div">{credit.description}</Typography>
                <Typography variant="body" as="div">{credit.amount} credits</Typography>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Coins className={styles.emptyIcon} />
            <Typography variant="h3" as="p">No credits yet</Typography>
            <Typography variant="body" as="p">
              Credits will appear here when you earn them through your membership
            </Typography>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
