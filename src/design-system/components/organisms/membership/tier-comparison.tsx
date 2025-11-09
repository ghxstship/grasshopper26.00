'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { MembershipTier } from '@/types/membership'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
    <div className="w-full">
      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={cn(
            'font-share-tech-mono text-sm uppercase tracking-wider px-6 py-3 border-2 border-black transition-colors',
            billingCycle === 'monthly'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-grey-100'
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('annual')}
          className={cn(
            'font-share-tech-mono text-sm uppercase tracking-wider px-6 py-3 border-2 border-black transition-colors relative',
            billingCycle === 'annual'
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-grey-100'
          )}
        >
          Annual
          <span className="absolute -top-2 -right-2 bg-black text-white px-2 py-1 text-xs font-bebas-neue">
            SAVE 20%
          </span>
        </button>
      </div>

      {/* Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
                'relative border-3 border-black p-6 transition-all',
                isCurrentTier && 'bg-black text-white',
                !isCurrentTier && 'bg-white text-black hover:shadow-geometric'
              )}
            >
              {/* Badge */}
              {(isPopular || isBestValue) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 font-bebas-neue text-sm tracking-wide">
                  {isPopular && 'MOST POPULAR'}
                  {isBestValue && 'BEST VALUE'}
                </div>
              )}

              {/* Tier Icon */}
              <div className="flex justify-center mb-4">
                <TierBadge icon={tier.badge_icon} color={tier.badge_color} />
              </div>

              {/* Tier Name */}
              <h3 className="font-bebas-neue text-3xl text-center uppercase tracking-wide mb-2">
                {tier.display_name}
              </h3>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="font-anton text-5xl">
                  ${price === 0 ? '0' : price?.toFixed(0)}
                </div>
                <div className="font-share-tech-mono text-xs uppercase tracking-wider mt-1">
                  {price === 0
                    ? 'Free Forever'
                    : billingCycle === 'annual'
                      ? '/Year'
                      : '/Month'}
                </div>
                {billingCycle === 'monthly' && price && price > 0 && (
                  <div className="font-share-tech text-xs mt-1 opacity-70">
                    ${(price * 12).toFixed(0)}/year billed monthly
                  </div>
                )}
              </div>

              {/* Key Benefits */}
              <div className="space-y-3 mb-6">
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
                className={cn(
                  'w-full font-bebas-neue text-lg tracking-wide',
                  isCurrentTier
                    ? 'bg-grey-400 text-grey-600 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-grey-900'
                )}
              >
                {isCurrentTier
                  ? 'CURRENT TIER'
                  : tier.annual_price === 0
                    ? 'JOIN FREE'
                    : 'SELECT TIER'}
              </Button>

              {/* View Details Link */}
              <button 
                className="w-full mt-3 font-share-tech-mono text-xs uppercase tracking-wider hover:underline"
                aria-label={`View all benefits for ${tier.display_name} tier`}
              >
                View All Benefits
              </button>
            </div>
          )
        })}
      </div>

      {/* Detailed Comparison Table */}
      <div className="mt-16">
        <h2 className="font-bebas-neue text-4xl text-center uppercase tracking-wide mb-8">
          Compare All Benefits
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-3 border-black">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="p-4 text-left font-bebas-neue text-xl uppercase bg-grey-100">
                  Benefit
                </th>
                {sortedTiers.map((tier) => (
                  <th
                    key={tier.id}
                    className={cn(
                      'p-4 text-center font-bebas-neue text-xl uppercase border-l-2 border-black',
                      tier.id === currentTierId && 'bg-black text-white'
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
        className="w-12 h-12 rounded-full border-3 border-black"
        style={{ backgroundColor: color }}
      />
    ),
    square: (
      <div
        className="w-12 h-12 border-3 border-black"
        style={{ backgroundColor: color }}
      />
    ),
    triangle: (
      <div className="relative w-12 h-12">
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            backgroundColor: color,
            border: '3px solid black',
          }}
        />
      </div>
    ),
    star: (
      <div className="relative w-12 h-12">
        <div
          className="absolute inset-0"
          style={{
            clipPath:
              'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            backgroundColor: color,
            border: '3px solid black',
          }}
        />
      </div>
    ),
    briefcase: (
      <div
        className="w-12 h-10 border-3 border-black relative"
        style={{ backgroundColor: color }}
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-black" />
      </div>
    ),
    crown: (
      <div className="relative w-12 h-12">
        <div
          className="absolute inset-0"
          style={{
            clipPath:
              'polygon(0% 100%, 0% 40%, 25% 60%, 50% 0%, 75% 60%, 100% 40%, 100% 100%)',
            backgroundColor: color,
            border: '3px solid black',
          }}
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
    <div className="flex items-start gap-2">
      <Check
        className={cn(
          'w-4 h-4 mt-0.5 flex-shrink-0',
          isCurrentTier ? 'text-white' : 'text-black'
        )}
      />
      <span className="font-share-tech text-sm">{text}</span>
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
    <tr className="border-t border-grey-200">
      <td className="p-4 font-share-tech text-sm bg-grey-50">{label}</td>
      {values.map((value, index) => (
        <td
          key={index}
          className={cn(
            'p-4 text-center font-share-tech-mono text-sm border-l border-grey-200',
            index === currentTierIndex && 'bg-black text-white'
          )}
        >
          {value}
        </td>
      ))}
    </tr>
  )
}
