'use client';

import React from 'react';
import styles from './TicketTierCard.module.css';
import { TicketTierBadge } from '../../atoms/TicketTierBadge';
import type { TicketTier } from '@/types/super-expansion';

export interface TicketTierCardProps {
  tier: TicketTier;
  showAvailability?: boolean;
  className?: string;
}

export const TicketTierCard: React.FC<TicketTierCardProps> = ({
  tier,
  showAvailability = true,
  className,
}) => {
  const availabilityPercentage = (tier.tickets_available / tier.total_capacity) * 100;
  const isLowAvailability = availabilityPercentage < 20;
  const isSoldOut = tier.tickets_available === 0;

  return (
    <div className={`${styles.card} ${isSoldOut ? styles.soldOut : ''} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.name}>{tier.tier_name}</h3>
        {tier.tier_type && <TicketTierBadge tierType={tier.tier_type} />}
      </div>

      <div className={styles.price}>
        <span className={styles.priceAmount}>
          ${tier.total_price.toFixed(2)}
        </span>
        {tier.fees > 0 && (
          <span className={styles.priceBreakdown}>
            ${tier.base_price.toFixed(2)} + ${tier.fees.toFixed(2)} fees
          </span>
        )}
      </div>

      {showAvailability && (
        <div className={styles.availability}>
          <div className={styles.availabilityBar}>
            <div 
              className={`${styles.availabilityFill} ${isLowAvailability ? styles.low : ''}`}
              style={{ width: `${100 - availabilityPercentage}%` }}
            />
          </div>
          <div className={styles.availabilityText}>
            {isSoldOut ? (
              <span className={styles.soldOutText}>SOLD OUT</span>
            ) : (
              <>
                <span className={styles.available}>{tier.tickets_available}</span>
                <span className={styles.separator}>/</span>
                <span className={styles.total}>{tier.total_capacity}</span>
                <span className={styles.label}>AVAILABLE</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

TicketTierCard.displayName = 'TicketTierCard';
