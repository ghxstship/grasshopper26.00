'use client';

import { PortalLayout } from '@/design-system';
import { PortalSidebar } from '@/design-system';
import { Text, Heading } from '@/design-system';
import { StatCard } from '@/design-system';
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
        <Heading level={2} font="bebas">
          Credit History
        </Heading>
        
        {credits && credits.length > 0 ? (
          <div className={styles.creditsList}>
            {credits.map((credit: any) => (
              <div key={credit.id} className={styles.creditItem}>
                <Text>{credit.description}</Text>
                <Text weight="medium">{credit.amount} credits</Text>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Coins className={styles.emptyIcon} />
            <Heading level={3} font="bebas">No credits yet</Heading>
            <Text color="secondary">
              Credits will appear here when you earn them through your membership
            </Text>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
