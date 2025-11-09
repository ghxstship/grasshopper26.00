'use client'

import { QRCodeSVG } from 'qrcode.react'
import { UserMembership } from '@/types/membership'
import { cn } from '@/lib/utils'

interface MembershipCardProps {
  membership: UserMembership | null
  profile: any
}

export function MembershipCard({ membership, profile }: MembershipCardProps) {
  if (!membership) {
    return (
      <div className="border-3 border-black p-8 bg-grey-100">
        <p className="font-share-tech text-center">
          No active membership. Join today to unlock benefits!
        </p>
      </div>
    )
  }

  const tier = membership.membership_tiers
  const memberSince = new Date(membership.start_date).getFullYear()
  const qrData = `GVTEWAY-MEMBER-${membership.id}`

  return (
    <div className="relative">
      {/* Digital Membership Card */}
      <div
        className="relative w-full aspect-[375/240] bg-black border-3 border-white p-6 flex flex-col justify-between"
        style={{
          boxShadow: '8px 8px 0px white, 8px 8px 0px 3px black',
        }}
      >
        {/* Geometric Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-1 bg-white transform -skew-y-12" />
          <div className="absolute top-1/4 left-0 w-full h-1 bg-white transform -skew-y-12" />
          <div className="absolute top-2/4 left-0 w-full h-1 bg-white transform -skew-y-12" />
          <div className="absolute top-3/4 left-0 w-full h-1 bg-white transform -skew-y-12" />
        </div>

        {/* Top Row: Badge + Logo */}
        <div className="relative flex items-start justify-between">
          {/* Tier Badge */}
          <div className="flex items-center gap-3">
            <TierBadge
              icon={tier?.badge_icon || 'circle'}
              color={tier?.badge_color || '#9CA3AF'}
            />
          </div>

          {/* Brand Logo */}
          <div className="font-anton text-2xl text-white tracking-wider">
            GVTEWAY
          </div>
        </div>

        {/* Center: Member Info */}
        <div className="relative">
          <div className="font-bebas-neue text-2xl text-white uppercase tracking-wide">
            {profile?.display_name || 'Member'}
          </div>
          <div className="font-share-tech-mono text-sm text-grey-400 uppercase tracking-widest mt-1">
            {tier?.display_name || 'Member'}
          </div>
        </div>

        {/* Bottom Row: Member Since + QR Code */}
        <div className="relative flex items-end justify-between">
          <div className="font-share-tech-mono text-xs text-grey-500 uppercase tracking-wider">
            Member Since: {memberSince}
          </div>

          {/* QR Code */}
          <div className="bg-white p-2 border-2 border-white">
            <QRCodeSVG value={qrData} size={64} level="M" />
          </div>
        </div>

        {/* Halftone Dots in Corners */}
        <div className="absolute top-4 right-4 w-8 h-8 opacity-20">
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-1 h-1 bg-white rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-4 flex gap-3">
        <button className="flex-1 border-2 border-black px-4 py-2 font-share-tech-mono text-xs uppercase tracking-wider hover:bg-black hover:text-white transition-colors">
          Add to Wallet
        </button>
        <button className="flex-1 border-2 border-black px-4 py-2 font-share-tech-mono text-xs uppercase tracking-wider hover:bg-black hover:text-white transition-colors">
          Download Card
        </button>
      </div>

      {/* Renewal Info */}
      {membership.renewal_date && (
        <div className="mt-4 p-4 border-2 border-grey-300 bg-grey-50">
          <div className="flex items-center justify-between">
            <span className="font-share-tech text-sm">Next Renewal:</span>
            <span className="font-share-tech-mono text-sm font-semibold">
              {new Date(membership.renewal_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          {!membership.auto_renew && (
            <div className="mt-2 text-sm font-share-tech text-red-600">
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
        className="w-12 h-12 rounded-full border-3 border-white"
        style={{ backgroundColor: color }}
      />
    ),
    square: (
      <div
        className="w-12 h-12 border-3 border-white"
        style={{ backgroundColor: color }}
      />
    ),
    triangle: (
      <div className="relative w-12 h-12">
        <div
          className="absolute inset-0 border-3 border-white"
          style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            backgroundColor: color,
          }}
        />
      </div>
    ),
    star: (
      <div className="relative w-12 h-12">
        <div
          className="absolute inset-0 border-3 border-white"
          style={{
            clipPath:
              'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            backgroundColor: color,
          }}
        />
      </div>
    ),
    briefcase: (
      <div
        className="w-12 h-10 border-3 border-white relative"
        style={{ backgroundColor: color }}
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-white" />
      </div>
    ),
    crown: (
      <div className="relative w-12 h-12">
        <div
          className="absolute inset-0 border-3 border-white"
          style={{
            clipPath:
              'polygon(0% 100%, 0% 40%, 25% 60%, 50% 0%, 75% 60%, 100% 40%, 100% 100%)',
            backgroundColor: color,
          }}
        />
      </div>
    ),
  }

  return iconMap[icon] || iconMap.circle
}
