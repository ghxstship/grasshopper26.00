import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PortalDashboardTemplate } from '@/design-system/components/templates'
import { MembershipCard } from '@/design-system/components/organisms/membership/membership-card'
import { UpcomingEvents } from '@/design-system/components/organisms/membership/upcoming-events'
import { AvailableBenefits } from '@/design-system/components/organisms/membership/available-benefits'
import { MemberEvents } from '@/design-system/components/organisms/membership/member-events'
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
    <PortalDashboardTemplate
      greeting={`Welcome Back, ${profile?.display_name || 'Member'}`}
      userInfo={
        membership ? (
          <>
            <span>{membership.membership_tiers?.display_name} Member</span>
            <span>•</span>
            <span>Since {new Date(membership.start_date).getFullYear()}</span>
          </>
        ) : undefined
      }
      primaryCard={<MembershipCard membership={membership} profile={profile} />}
      statsCards={[
        {
          label: 'Ticket Credits',
          value: membership?.credits_remaining || 0,
          icon: <Ticket />,
        },
        {
          label: 'Benefits Used',
          value: recentBenefits?.length || 0,
          icon: <Gift />,
        },
        {
          label: 'Upcoming Events',
          value: upcomingTickets?.length || 0,
          icon: <Calendar />,
        },
      ]}
      sections={[
        {
          id: 'upcoming-events',
          title: 'Your Upcoming Events',
          content: <UpcomingEvents tickets={upcomingTickets || []} />,
          isEmpty: !upcomingTickets || upcomingTickets.length === 0,
          emptyState: {
            icon: <Calendar />,
            title: 'No upcoming events',
            description: 'Browse events to find your next experience',
            action: {
              label: 'Browse Events',
              onClick: () => window.location.href = '/events',
            },
          },
        },
        {
          id: 'benefits',
          title: 'Available Benefits',
          content: membership ? <AvailableBenefits membership={membership} /> : null,
          isEmpty: !membership,
          emptyState: {
            icon: <Gift />,
            title: 'Join GVTEWAY Membership',
            description: 'Unlock exclusive benefits, ticket credits, early access, and more.',
            action: {
              label: 'Explore Membership Tiers',
              onClick: () => window.location.href = '/membership',
            },
          },
        },
        {
          id: 'member-events',
          title: 'Member-Only Events',
          content: <MemberEvents events={memberEvents || []} membership={membership} />,
          isEmpty: !memberEvents || memberEvents.length === 0,
        },
      ]}
      layout="single-column"
    />
  )
}
