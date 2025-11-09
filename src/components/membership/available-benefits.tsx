'use client';

import { Ticket, Gift, Star, Zap } from 'lucide-react';
import Link from 'next/link';

interface AvailableBenefitsProps {
  membership: any;
}

export function AvailableBenefits({ membership }: AvailableBenefitsProps) {
  const tier = membership.membership_tiers;
  
  const benefits = [
    {
      icon: Ticket,
      title: 'Monthly Ticket Credits',
      value: tier.ticket_credits_monthly || 0,
      description: 'Free tickets each month',
      action: 'Browse Events',
      href: '/events',
      available: true,
    },
    {
      icon: Gift,
      title: 'VIP Vouchers',
      value: tier.vip_vouchers_annual || 0,
      description: 'Upgrade to VIP annually',
      action: 'View Vouchers',
      href: '/portal/vouchers',
      available: tier.vip_vouchers_annual > 0,
    },
    {
      icon: Star,
      title: 'Priority Access',
      value: tier.priority_access ? 'Enabled' : 'Not Available',
      description: 'Early ticket sales access',
      action: 'Learn More',
      href: '/membership',
      available: tier.priority_access,
    },
    {
      icon: Zap,
      title: 'Member Discount',
      value: `${tier.discount_percentage || 0}%`,
      description: 'Off all purchases',
      action: 'Shop Now',
      href: '/events',
      available: tier.discount_percentage > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {benefits.map((benefit) => {
        const Icon = benefit.icon;
        return (
          <div
            key={benefit.title}
            className={`border-3 border-black p-6 ${
              benefit.available ? 'bg-white' : 'bg-grey-100'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-black text-white">
                <Icon className="h-6 w-6" />
              </div>
              {benefit.available && (
                <span className="font-share-tech-mono text-xs uppercase tracking-wider text-green-600 bg-green-100 px-2 py-1">
                  Active
                </span>
              )}
            </div>
            <h3 className="font-bebas-neue text-xl uppercase tracking-wide mb-2">
              {benefit.title}
            </h3>
            <p className="font-share-tech-mono text-2xl font-bold mb-2">
              {benefit.value}
            </p>
            <p className="font-share-tech text-sm text-grey-600 mb-4">
              {benefit.description}
            </p>
            {benefit.available && (
              <Link
                href={benefit.href}
                className="inline-block border-2 border-black px-4 py-2 font-share-tech-mono text-sm uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
              >
                {benefit.action} →
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
