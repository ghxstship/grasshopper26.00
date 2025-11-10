'use client';

import { Ticket, Calendar, TrendingUp, Gift } from 'lucide-react';
import styles from './quick-stats.module.css';

interface QuickStatsProps {
  membership: any;
  recentBenefits: any[];
}

export function QuickStats({ membership, recentBenefits }: QuickStatsProps) {
  // Calculate stats
  const eventsAttended = recentBenefits?.filter(b => b.benefit_type === 'event_attendance').length || 0;
  const creditsUsed = recentBenefits?.filter(b => b.benefit_type === 'ticket_credit').length || 0;
  const vouchersUsed = recentBenefits?.filter(b => b.benefit_type === 'vip_voucher').length || 0;
  
  const stats = [
    {
      label: 'Events Attended',
      value: eventsAttended,
      icon: Calendar,
      color: 'bg-black text-black',
    },
    {
      label: 'Credits Used',
      value: creditsUsed,
      icon: Ticket,
      color: 'bg-grey-100 text-black',
    },
    {
      label: 'Vouchers Redeemed',
      value: vouchersUsed,
      icon: Gift,
      color: 'bg-pink-100 text-pink-600',
    },
    {
      label: 'Member Since',
      value: membership ? new Date(membership.start_date).getFullYear() : '-',
      icon: TrendingUp,
      color: 'bg-grey-100 text-black',
    },
  ];

  return (
    <div className={styles.card}>
      <h3 className={styles.card}>
        Quick Stats
      </h3>
      <div className={styles.grid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={styles.card}>
              <div className={`${styles.iconContainer} ${stat.color}`}>
                <Icon className={styles.icon} />
              </div>
              <p className={styles.text}>
                {stat.value}
              </p>
              <p className={styles.text}>
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
