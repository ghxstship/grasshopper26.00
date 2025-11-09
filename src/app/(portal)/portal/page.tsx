import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MembershipCard } from '@/components/membership/membership-card'
import { QuickStats } from '@/components/membership/quick-stats'
import { UpcomingEvents } from '@/components/membership/upcoming-events'
import { AvailableBenefits } from '@/components/membership/available-benefits'
import { MemberEvents } from '@/components/membership/member-events'

export default async function PortalPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/portal')
  }

  // Fetch user's active membership
  const { data: membership } = await supabase
    .from('user_memberships')
    .select('*, membership_tiers(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch upcoming events with tickets
  const { data: upcomingTickets } = await supabase
    .from('tickets')
    .select('*, events(*), orders(*)')
    .eq('user_id', user.id)
    .gte('events.start_date', new Date().toISOString())
    .order('events.start_date', { ascending: true })
    .limit(5)

  // Fetch recent benefit usage
  const { data: recentBenefits } = await supabase
    .from('membership_benefit_usage')
    .select('*')
    .eq('membership_id', membership?.id)
    .order('used_at', { ascending: false })
    .limit(10)

  // Fetch member-only events
  const { data: memberEvents } = await supabase
    .from('member_events')
    .select('*, events(*)')
    .gte('events.start_date', new Date().toISOString())
    .lte('min_tier_level', membership?.membership_tiers?.tier_level || 0)
    .order('events.start_date', { ascending: true })
    .limit(4)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-3 border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-bebas-neue text-5xl uppercase tracking-wide">
            Welcome Back, {profile?.display_name || 'Member'}
          </h1>
          {membership && (
            <div className="flex items-center gap-3 mt-2">
              <span className="font-share-tech-mono text-sm uppercase tracking-wider text-grey-600">
                {membership.membership_tiers?.display_name} Member
              </span>
              <span className="text-grey-400">•</span>
              <span className="font-share-tech-mono text-sm uppercase tracking-wider text-grey-600">
                Since {new Date(membership.start_date).getFullYear()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section: Card + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <MembershipCard
            membership={membership}
            profile={profile}
          />
          <QuickStats
            membership={membership}
            recentBenefits={recentBenefits || []}
          />
        </div>

        {/* Upcoming Events */}
        {upcomingTickets && upcomingTickets.length > 0 && (
          <div className="mb-12">
            <h2 className="font-bebas-neue text-3xl uppercase tracking-wide mb-6 border-b-2 border-black pb-2">
              Your Upcoming Events
            </h2>
            <UpcomingEvents tickets={upcomingTickets} />
          </div>
        )}

        {/* Available Benefits */}
        {membership && (
          <div className="mb-12">
            <h2 className="font-bebas-neue text-3xl uppercase tracking-wide mb-6 border-b-2 border-black pb-2">
              Available Benefits
            </h2>
            <AvailableBenefits membership={membership} />
          </div>
        )}

        {/* Member-Only Events */}
        {memberEvents && memberEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="font-bebas-neue text-3xl uppercase tracking-wide mb-6 border-b-2 border-black pb-2">
              Member-Only Events
            </h2>
            <MemberEvents events={memberEvents} membership={membership} />
          </div>
        )}

        {/* No Membership CTA */}
        {!membership && (
          <div className="border-3 border-black p-12 text-center">
            <h2 className="font-bebas-neue text-4xl uppercase tracking-wide mb-4">
              Join GVTEWAY Membership
            </h2>
            <p className="font-share-tech text-lg mb-8 max-w-2xl mx-auto">
              Unlock exclusive benefits, ticket credits, early access, and more.
              Choose the tier that fits your lifestyle.
            </p>
            <a
              href="/membership"
              className="inline-block bg-black text-white px-8 py-4 font-bebas-neue text-xl uppercase tracking-wide hover:bg-grey-900 transition-colors"
            >
              Explore Membership Tiers
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
