import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PortalLayout } from '@/design-system/components/templates/PortalLayout/PortalLayout'
import { PortalSidebar } from '@/design-system/components/organisms/PortalSidebar/PortalSidebar'
import { MembershipCard } from '@/design-system/components/organisms/MembershipCard/MembershipCard'
import { Typography } from '@/design-system/components/atoms/Typography/Typography'
import { StatCard } from '@/design-system/components/molecules/StatCard/StatCard'
import { Ticket, Gift, Calendar } from 'lucide-react'

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
    <PortalLayout
      sidebar={<PortalSidebar />}
      title={`Welcome Back, ${profile?.display_name || 'Member'}`}
      description={
        membership
          ? `${membership.membership_tiers?.display_name} Member • Since ${new Date(membership.start_date).getFullYear()}`
          : 'Member Portal'
      }
    >
      <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
        <MembershipCard membership={membership} profile={profile} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          <StatCard
            label="Ticket Credits"
            value={membership?.credits_remaining || 0}
            icon={<Ticket />}
          />
          <StatCard
            label="Benefits Used"
            value={recentBenefits?.length || 0}
            icon={<Gift />}
          />
          <StatCard
            label="Upcoming Events"
            value={upcomingTickets?.length || 0}
            icon={<Calendar />}
          />
        </div>

        <div>
          <Typography variant="h3" as="h2">
            Your Upcoming Events
          </Typography>
          {upcomingTickets && upcomingTickets.length > 0 ? (
            <div>Upcoming events list</div>
          ) : (
            <Typography variant="body" as="p">
              No upcoming events
            </Typography>
          )}
        </div>
      </div>
    </PortalLayout>
  )
}
