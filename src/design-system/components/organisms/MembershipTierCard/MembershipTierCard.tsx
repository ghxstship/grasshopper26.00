/**
 * MembershipTierCard Organism
 * GHXSTSHIP Monochromatic Design System
 */

import * as React from "react";
import { Typography } from '../../atoms/Typography/Typography';
import { Button } from '../../atoms/Button/Button';
import { Check } from 'lucide-react';
import styles from './MembershipTierCard.module.css';

export interface MembershipTierCardProps {
  tier: {
    id: string;
    tier_name: string;
    display_name: string;
    tier_level: number;
    annual_price: number;
    monthly_price: number;
    benefits: string[];
    featured?: boolean;
    companion_pass?: {
      id: string;
      monthly_price: number;
      annual_price: number;
      max_companions: number;
    };
  };
  onClick?: () => void;
  isAnnual?: boolean;
}

export const MembershipTierCard: React.FC<MembershipTierCardProps> = ({
  tier,
  onClick,
  isAnnual = true,
}) => {
  const displayPrice = isAnnual ? tier.annual_price : tier.monthly_price;
  const priceLabel = isAnnual ? '/year' : '/month';
  const alternatePrice = isAnnual ? tier.monthly_price : tier.annual_price;
  const alternateLabel = isAnnual ? 'month' : 'year';

  return (
    <div className={`${styles.card} ${tier.featured ? styles.featured : ''}`}>
      {tier.featured && (
        <div className={styles.badge}>
          Popular
        </div>
      )}
      
      <div className={styles.header}>
        <Typography variant="h3" as="h2">
          {tier.display_name}
        </Typography>
        <div className={styles.price}>
          <Typography variant="h2" as="div">
            ${displayPrice}
          </Typography>
          <Typography variant="meta" as="div">
            {priceLabel}
          </Typography>
        </div>
        <Typography variant="body" as="div" className={styles.monthly}>
          or ${alternatePrice}/{alternateLabel}
        </Typography>
      </div>
      
      <ul className={styles.benefits}>
        {tier.benefits?.map((benefit, index) => (
          <li key={index} className={styles.benefit}>
            <Check className={styles.checkIcon} />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      {tier.companion_pass && (
        <div className={styles.companionPass}>
          <Typography variant="body" as="div" className={styles.companionPassLabel}>
            + Companion Pass Add-on
          </Typography>
          <Typography variant="meta" as="div" className={styles.companionPassPrice}>
            ${isAnnual ? tier.companion_pass.annual_price : tier.companion_pass.monthly_price}/{isAnnual ? 'year' : 'month'}
          </Typography>
        </div>
      )}
      
      <Button
        variant={tier.featured ? 'filled' : 'outlined'}
        fullWidth
        onClick={onClick}
      >
        Select Plan
      </Button>
    </div>
  );
};
