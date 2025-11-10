'use client';

import { Ticket, Gift, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import styles from './available-benefits.module.css';

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
    <div className={styles.grid}>
      {benefits.map((benefit) => {
        const Icon = benefit.icon;
        return (
          <div
            key={benefit.title}
            className={`${styles.benefitCard} ${
              benefit.available ? styles.benefitAvailable : styles.benefitUnavailable
            }`}
          >
            <div className={styles.container}>
              <div className={styles.card}>
                <Icon className={styles.icon} />
              </div>
              {benefit.available && (
                <span className={styles.card}>
                  Active
                </span>
              )}
            </div>
            <h3 className={styles.text}>
              {benefit.title}
            </h3>
            <p className={styles.text}>
              {benefit.value}
            </p>
            <p className={styles.text}>
              {benefit.description}
            </p>
            {benefit.available && (
              <Link
                href={benefit.href}
                className={styles.card}
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
