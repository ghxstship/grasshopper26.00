'use client';

import { Ticket, Calendar, TrendingUp, Gift } from 'lucide-react';

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
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Credits Used',
      value: creditsUsed,
      icon: Ticket,
      color: 'bg-blue-100 text-blue-600',
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
      color: 'bg-green-100 text-green-600',
    },
  ];

  return (
    <div className="border-3 border-black bg-white p-6">
      <h3 className="font-bebas-neue text-2xl uppercase tracking-wide mb-6 border-b-2 border-black pb-2">
        Quick Stats
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="border-2 border-black p-4">
              <div className={`inline-flex p-2 rounded ${stat.color} mb-2`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-share-tech-mono text-3xl font-bold mb-1">
                {stat.value}
              </p>
              <p className="font-share-tech text-sm text-grey-600 uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
