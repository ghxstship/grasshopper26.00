'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { MembershipTier } from '@/types/membership'
import { Button } from '@/design-system/components/atoms/button'
import { cn } from '@/lib/utils'
import styles from './tier-comparison.module.css'

interface TierComparisonProps {
  tiers: MembershipTier[]
  currentTierId?: string
  onSelectTier: (tier: MembershipTier, billingCycle: 'annual' | 'monthly') => void
}

export function TierComparison({
  tiers,
  currentTierId,
  onSelectTier,
}: TierComparisonProps) {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual')

  // Sort tiers by level
  const sortedTiers = [...tiers].sort((a, b) => a.tier_level - b.tier_level)

  // Determine which tiers to highlight
  const mainTier = sortedTiers.find((t) => t.tier_slug === 'main')
  const extraTier = sortedTiers.find((t) => t.tier_slug === 'extra')

  return (
    <div className={styles.container}>
      {/* Billing Cycle Toggle */}
      <div className={styles.billingToggle}>
        <button
          onClick={() => setBillingCycle('monthly')}
          className={cn(
            styles.billingButton,
            billingCycle === 'monthly' && styles.billingButtonActive
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('annual')}
          className={cn(
            styles.billingButton,
            billingCycle === 'annual' && styles.billingButtonActive
          )}
        >
          Annual
          <span className={styles.saveBadge}>
            SAVE 20%
          </span>
        </button>
      </div>

      {/* Tier Grid */}
      <div className={styles.tierGrid}>
        {sortedTiers.map((tier) => {
          const isCurrentTier = tier.id === currentTierId
          const isPopular = tier.id === mainTier?.id
          const isBestValue = tier.id === extraTier?.id
          const price =
            billingCycle === 'annual' ? tier.annual_price : tier.monthly_price

          return (
            <div
              key={tier.id}
              className={cn(
                styles.tierCard,
                isCurrentTier && styles.tierCardCurrent
              )}
            >
              {/* Badge */}
              {(isPopular || isBestValue) && (
                <div className={styles.popularBadge}>
                  {isPopular && 'MOST POPULAR'}
                  {isBestValue && 'BEST VALUE'}
                </div>
              )}

              {/* Tier Icon */}
              <div className={styles.tierIcon}>
                <TierBadge icon={tier.badge_icon} color={tier.badge_color} />
              </div>

              {/* Tier Name */}
              <h3 className={styles.tierName}>
                {tier.display_name}
              </h3>

              {/* Price */}
              <div className={styles.priceContainer}>
                <div className={styles.price}>
                  ${price === 0 ? '0' : price?.toFixed(0)}
                </div>
                <div className={styles.pricePeriod}>
                  {price === 0
                    ? 'Free Forever'
                    : billingCycle === 'annual'
                      ? '/Year'
                      : '/Month'}
                </div>
                {billingCycle === 'monthly' && price && price > 0 && (
                  <div className={styles.priceAnnual}>
                    ${(price * 12).toFixed(0)}/year billed monthly
                  </div>
                )}
              </div>

              {/* Key Benefits */}
              <div className={styles.benefits}>
                {tier.limits.credits_per_quarter && (
                  <BenefitItem
                    text={`${tier.limits.credits_per_quarter} ticket${tier.limits.credits_per_quarter > 1 ? 's' : ''}/quarter`}
                    isCurrentTier={isCurrentTier}
                  />
                )}
                {tier.limits.ticket_discount && tier.limits.ticket_discount > 0 && (
                  <BenefitItem
                    text={`${tier.limits.ticket_discount}% ticket discount`}
                    isCurrentTier={isCurrentTier}
                  />
                )}
                {tier.limits.early_access_hours &&
                  tier.limits.early_access_hours > 0 && (
                    <BenefitItem
                      text={`${tier.limits.early_access_hours}h early access`}
                      isCurrentTier={isCurrentTier}
                    />
                  )}
                {tier.limits.vip_upgrades_per_year &&
                  tier.limits.vip_upgrades_per_year > 0 && (
                    <BenefitItem
                      text={`${tier.limits.vip_upgrades_per_year} VIP upgrades/year`}
                      isCurrentTier={isCurrentTier}
                    />
                  )}
                {tier.limits.merchandise_discount &&
                  tier.limits.merchandise_discount > 0 && (
                    <BenefitItem
                      text={`${tier.limits.merchandise_discount}% merch discount`}
                      isCurrentTier={isCurrentTier}
                    />
                  )}
                {tier.limits.guests_allowed && tier.limits.guests_allowed > 0 && (
                  <BenefitItem
                    text={`+${tier.limits.guests_allowed} guest${tier.limits.guests_allowed > 1 ? 's' : ''}`}
                    isCurrentTier={isCurrentTier}
                  />
                )}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => onSelectTier(tier, billingCycle)}
                disabled={isCurrentTier}
                className={styles.ctaButton}
              >
                {isCurrentTier
                  ? 'CURRENT TIER'
                  : tier.annual_price === 0
                    ? 'JOIN FREE'
                    : 'SELECT TIER'}
              </Button>

              {/* View Details Link */}
              <button 
                className={styles.viewDetailsButton}
                aria-label={`View all benefits for ${tier.display_name} tier`}
              >
                View All Benefits
              </button>
            </div>
          )
        })}
      </div>

      {/* Detailed Comparison Table */}
      <div className={styles.comparisonSection}>
        <h2 className={styles.comparisonTitle}>
          Compare All Benefits
        </h2>
        <div className={styles.comparisonTableWrapper}>
          <table className={styles.comparisonTable}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableHeaderCell}>
                  Benefit
                </th>
                {sortedTiers.map((tier) => (
                  <th
                    key={tier.id}
                    className={cn(
                      styles.tableHeaderCellTier,
                      tier.id === currentTierId && styles.tableHeaderCellCurrent
                    )}
                  >
                    {tier.display_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <BenefitRow
                label="Purchase Tickets"
                values={sortedTiers.map((t, i) =>
                  t.limits.can_purchase_tickets !== false ? <Check key={i} /> : <X key={i} />
                )}
                currentTierIndex={sortedTiers.findIndex(
                  (t) => t.id === currentTierId
                )}
              />
              <BenefitRow
                label="Ticket Discount"
                values={sortedTiers.map(
                  (t) => `${t.limits.ticket_discount || 0}%`
                )}
                currentTierIndex={sortedTiers.findIndex(
                  (t) => t.id === currentTierId
                )}
              />
              <BenefitRow
                label="Early Access"
                values={sortedTiers.map(
                  (t) => `${t.limits.early_access_hours || 0}h`
                )}
                currentTierIndex={sortedTiers.findIndex(
                  (t) => t.id === currentTierId
                )}
              />
              <BenefitRow
                label="Quarterly Ticket Credits"
                values={sortedTiers.map(
                  (t) => t.limits.credits_per_quarter || '—'
                )}
                currentTierIndex={sortedTiers.findIndex(
                  (t) => t.id === currentTierId
                )}
              />
              <BenefitRow
                label="VIP Upgrades/Year"
                values={sortedTiers.map(
                  (t) => t.limits.vip_upgrades_per_year || '—'
                )}
                currentTierIndex={sortedTiers.findIndex(
                  (t) => t.id === currentTierId
                )}
              />
              <BenefitRow
                label="Merchandise Discount"
                values={sortedTiers.map(
                  (t) => `${t.limits.merchandise_discount || 0}%`
                )}
                currentTierIndex={sortedTiers.findIndex(
                  (t) => t.id === currentTierId
                )}
              />
              <BenefitRow
                label="Guest Privileges"
                values={sortedTiers.map((t) =>
                  t.limits.guests_allowed ? `+${t.limits.guests_allowed}` : '—'
                )}
                currentTierIndex={sortedTiers.findIndex(
                  (t) => t.id === currentTierId
                )}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function TierBadge({ icon, color }: { icon: string; color: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    circle: (
      <div
        className={styles.badgeCircle}
        style={{ backgroundColor: color }}
      />
    ),
    square: (
      <div
        className={styles.badgeSquare}
        style={{ backgroundColor: color }}
      />
    ),
    triangle: (
      <div className={styles.badgeTriangle}>
        <div
          className={styles.badgeTriangleInner}
          style={{ backgroundColor: color }}
        />
      </div>
    ),
    star: (
      <div className={styles.badgeStar}>
        <div
          className={styles.badgeStarInner}
          style={{ backgroundColor: color }}
        />
      </div>
    ),
    briefcase: (
      <div
        className={styles.badgeBriefcase}
        style={{ backgroundColor: color }}
      >
        <div className={styles.badgeBriefcaseHandle} />
      </div>
    ),
    crown: (
      <div className={styles.badgeCrown}>
        <div
          className={styles.badgeCrownInner}
          style={{ backgroundColor: color }}
        />
      </div>
    ),
  }

  return iconMap[icon] || iconMap.circle
}

function BenefitItem({
  text,
  isCurrentTier,
}: {
  text: string
  isCurrentTier: boolean
}) {
  return (
    <div className={styles.benefit}>
      <Check
        className={cn(
          styles.benefitIcon,
          isCurrentTier ? styles.benefitIconCurrent : styles.benefitIconDefault
        )}
      />
      <span className={styles.benefitText}>{text}</span>
    </div>
  )
}

function BenefitRow({
  label,
  values,
  currentTierIndex,
}: {
  label: string
  values: (string | number | React.ReactNode)[]
  currentTierIndex: number
}) {
  return (
    <tr className={styles.tableRow}>
      <td className={styles.tableCell}>{label}</td>
      {values.map((value, index) => (
        <td
          key={index}
          className={cn(
            styles.tableCellValue,
            index === currentTierIndex && styles.tableCellCurrent
          )}
        >
          {value}
        </td>
      ))}
    </tr>
  )
}
