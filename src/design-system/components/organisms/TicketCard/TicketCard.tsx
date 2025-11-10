'use client';

import React from 'react';
import Link from 'next/link';
import styles from './TicketCard.module.css';

export interface TicketCardProps {
  /** Ticket type name */
  title: string;
  /** Ticket subtitle/description */
  subtitle?: string;
  /** Price amount */
  price: string;
  /** Price prefix (e.g., "FROM") */
  pricePrefix?: string;
  /** Price period (e.g., "PER PERSON", "3-DAY PASS") */
  pricePeriod?: string;
  /** List of features/perks */
  features: string[];
  /** Purchase link */
  href: string;
  /** Button text */
  buttonText?: string;
  /** Badge text (e.g., "BEST VALUE", "VIP") */
  badge?: string;
  /** Featured/highlighted ticket */
  featured?: boolean;
  /** Sold out status */
  soldOut?: boolean;
  /** Availability text */
  availability?: string;
  /** Availability level */
  availabilityLevel?: 'high' | 'medium' | 'low';
  /** Additional CSS class */
  className?: string;
}

/**
 * TicketCard Organism - GHXSTSHIP Design System
 * 
 * Ticket type card with:
 * - ANTON price typography
 * - BEBAS NEUE ticket type names
 * - SHARE TECH feature lists
 * - Thick 3px borders
 * - Hard geometric shadows on hover
 * - Featured variant with inverted colors
 * 
 * @example
 * ```tsx
 * <TicketCard
 *   title="VIP EXPERIENCE"
 *   subtitle="Premium Access"
 *   price="$799"
 *   pricePrefix="FROM"
 *   pricePeriod="3-DAY PASS"
 *   features={[
 *     'VIP Viewing Areas',
 *     'Exclusive Lounge Access',
 *     'Complimentary Drinks',
 *     'Premium Parking',
 *   ]}
 *   href="/tickets/vip"
 *   badge="BEST VALUE"
 *   featured
 * />
 * ```
 */
export const TicketCard: React.FC<TicketCardProps> = ({
  title,
  subtitle,
  price,
  pricePrefix = 'FROM',
  pricePeriod,
  features,
  href,
  buttonText = 'BUY TICKETS',
  badge,
  featured = false,
  soldOut = false,
  availability,
  availabilityLevel = 'high',
  className = '',
}) => {
  const cardClasses = [
    styles.card,
    featured && styles.featured,
    soldOut && styles.soldOut,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const availabilityClasses = [
    styles.availability,
    availabilityLevel === 'low' && styles.low,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses}>
      <div className={styles.header}>
        {badge && <div className={styles.badge}>{badge}</div>}
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      <div className={styles.pricing}>
        <div className={styles.price}>
          <span className={styles.pricePrefix}>{pricePrefix}</span>
          {price}
        </div>
        {pricePeriod && <div className={styles.pricePeriod}>{pricePeriod}</div>}
      </div>

      <div className={styles.features}>
        <ul className={styles.featuresList}>
          {features.map((feature, index) => (
            <li key={index} className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.footer}>
        {soldOut ? (
          <button className={styles.button} disabled>
            SOLD OUT
          </button>
        ) : (
          <Link href={href} className={styles.button}>
            {buttonText}
          </Link>
        )}
        {availability && (
          <div className={availabilityClasses}>{availability}</div>
        )}
      </div>
    </div>
  );
};

TicketCard.displayName = 'TicketCard';
