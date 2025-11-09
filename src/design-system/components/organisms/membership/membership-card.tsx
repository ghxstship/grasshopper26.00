'use client'

import { QRCodeSVG } from 'qrcode.react'
import { UserMembership } from '@/types/membership'
import { cn } from '@/lib/utils'
import styles from './membership-card.module.css'

interface MembershipCardProps {
  membership: UserMembership | null
  profile: any
}

export function MembershipCard({ membership, profile }: MembershipCardProps) {
  if (!membership) {
    return (
      <div className={styles.noMembership}>
        <p className={styles.noMembershipText}>
          No active membership. Join today to unlock benefits!
        </p>
      </div>
    )
  }

  const tier = membership.membership_tiers
  const memberSince = new Date(membership.start_date).getFullYear()
  const qrData = `GVTEWAY-MEMBER-${membership.id}`

  return (
    <div className={styles.container}>
      {/* Digital Membership Card */}
      <div className={styles.card}>
        {/* Geometric Background Pattern */}
        <div className={styles.backgroundPattern}>
          <div className={`${styles.patternLine} ${styles.patternLine1}`} />
          <div className={`${styles.patternLine} ${styles.patternLine2}`} />
          <div className={`${styles.patternLine} ${styles.patternLine3}`} />
          <div className={`${styles.patternLine} ${styles.patternLine4}`} />
        </div>

        {/* Top Row: Badge + Logo */}
        <div className={styles.topRow}>
          {/* Tier Badge */}
          <div className={styles.badgeWrapper}>
            <TierBadge
              icon={tier?.badge_icon || 'circle'}
              color={tier?.badge_color || 'var(--color-text-tertiary)'}
            />
          </div>

          {/* Brand Logo */}
          <div className={styles.logo}>
            GVTEWAY
          </div>
        </div>

        {/* Center: Member Info */}
        <div className={styles.memberInfo}>
          <div className={styles.memberName}>
            {profile?.display_name || 'Member'}
          </div>
          <div className={styles.tierName}>
            {tier?.display_name || 'Member'}
          </div>
        </div>

        {/* Bottom Row: Member Since + QR Code */}
        <div className={styles.bottomRow}>
          <div className={styles.memberSince}>
            Member Since: {memberSince}
          </div>

          {/* QR Code */}
          <div className={styles.qrCode}>
            <QRCodeSVG value={qrData} size={64} level="M" />
          </div>
        </div>

        {/* Halftone Dots in Corners */}
        <div className={styles.halftone}>
          <div className={styles.halftoneGrid}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className={styles.halftoneDot} />
            ))}
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className={styles.actions}>
        <button 
          className={styles.actionButton}
          aria-label="Add membership card to digital wallet"
        >
          Add to Wallet
        </button>
        <button 
          className={styles.actionButton}
          aria-label="Download membership card as image"
        >
          Download Card
        </button>
      </div>

      {/* Renewal Info */}
      {membership.renewal_date && (
        <div className={styles.renewalInfo}>
          <div className={styles.renewalRow}>
            <span className={styles.renewalLabel}>Next Renewal:</span>
            <span className={styles.renewalDate}>
              {new Date(membership.renewal_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          {!membership.auto_renew && (
            <div className={styles.renewalWarning}>
              Auto-renewal is OFF. Enable to keep your benefits.
            </div>
          )}
        </div>
      )}
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
