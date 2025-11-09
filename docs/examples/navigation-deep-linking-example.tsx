/**
 * Navigation & Deep Linking Examples
 * 
 * This file demonstrates various use cases for breadcrumb navigation
 * and deep linking utilities in the GVTEWAY application.
 */

import { PageBreadcrumbs } from '@/components/ui/page-breadcrumbs'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { deepLinks, generateShareableLink, preserveQueryParams } from '@/lib/deep-linking'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ============================================================================
// Example 1: Basic Page with Auto-Generated Breadcrumbs
// ============================================================================

export function EventDetailPage({ eventId }: { eventId: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs automatically generated from route */}
      <PageBreadcrumbs />
      
      <h1>Event Details</h1>
      
      {/* Use deep link generator for checkout */}
      <Link 
        href={deepLinks.eventCheckout(eventId, 'general')}
        className="btn-primary"
      >
        Buy Tickets
      </Link>
    </div>
  )
}

// ============================================================================
// Example 2: Custom Breadcrumbs with Manual Items
// ============================================================================

export function CustomBreadcrumbPage() {
  const breadcrumbItems = [
    { label: 'Events', href: '/events' },
    { label: 'Summer Festival 2024', href: '/events/summer-festival-2024' },
    { label: 'Artist Lineup' }, // Current page - no href
  ]
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb 
        items={breadcrumbItems} 
        showHome={true}
      />
      
      <h1>Artist Lineup</h1>
    </div>
  )
}

// ============================================================================
// Example 3: Deep Linking for Event Management
// ============================================================================

export function EventManagementCard({ event }: { event: any }) {
  return (
    <div className="card">
      <h3>{event.name}</h3>
      
      {/* Public event page */}
      <Link href={deepLinks.event(event.slug)}>
        View Event
      </Link>
      
      {/* Admin edit page */}
      <Link href={deepLinks.adminEvent(event.id, 'edit')}>
        Edit Event
      </Link>
      
      {/* Admin ticket management */}
      <Link href={deepLinks.adminEvent(event.id, 'tickets')}>
        Manage Tickets
      </Link>
    </div>
  )
}

// ============================================================================
// Example 4: Shareable Links with UTM Tracking
// ============================================================================

export function ShareEventButton({ eventSlug }: { eventSlug: string }) {
  const handleShare = async () => {
    // Generate shareable link with UTM parameters
    const shareLink = generateShareableLink(`/events/${eventSlug}`, {
      source: 'app',
      medium: 'social',
      campaign: 'event-share',
      content: 'share-button',
    })
    
    const fullUrl = `${window.location.origin}${shareLink}`
    
    if (navigator.share) {
      await navigator.share({
        title: 'Check out this event!',
        text: 'Join me at this amazing event',
        url: fullUrl,
      })
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(fullUrl)
      alert('Link copied to clipboard!')
    }
  }
  
  return (
    <button onClick={handleShare} className="btn-secondary">
      Share Event
    </button>
  )
}

// ============================================================================
// Example 5: Preserving Query Parameters During Navigation
// ============================================================================

export function NavigationWithUTMPreservation() {
  const router = useRouter()
  
  const navigateToArtists = () => {
    // Preserve UTM parameters when navigating
    const link = preserveQueryParams('/artists', [
      'utm_source',
      'utm_medium',
      'utm_campaign',
    ])
    router.push(link)
  }
  
  return (
    <button onClick={navigateToArtists}>
      Browse Artists
    </button>
  )
}

// ============================================================================
// Example 6: Authentication Return URL Flow
// ============================================================================

export function ProtectedContentButton({ contentPath }: { contentPath: string }) {
  const router = useRouter()
  
  const handleClick = () => {
    // Generate return URL for post-login redirect
    const returnUrl = encodeURIComponent(contentPath)
    router.push(`/login?return=${returnUrl}`)
  }
  
  return (
    <button onClick={handleClick}>
      Login to View
    </button>
  )
}

// In the login page after successful authentication:
export function LoginSuccessRedirect({ searchParams }: { searchParams: any }) {
  const router = useRouter()
  
  const handleLoginSuccess = () => {
    // Parse and validate return URL
    const returnUrl = searchParams.get('return')
    const safePath = returnUrl 
      ? decodeURIComponent(returnUrl)
      : '/profile'
    
    // Redirect to the safe path
    router.push(safePath)
  }
  
  return null // This would be part of your login logic
}

// ============================================================================
// Example 7: Order Management with Deep Links
// ============================================================================

export function OrdersList({ orders }: { orders: any[] }) {
  return (
    <div className="space-y-4">
      <PageBreadcrumbs />
      
      <h1>Your Orders</h1>
      
      {orders.map(order => (
        <div key={order.id} className="card">
          <h3>Order #{order.id.slice(0, 8)}</h3>
          
          {/* Link to order details */}
          <Link href={deepLinks.order(order.id)}>
            View Details
          </Link>
          
          {/* Link to specific section with highlight */}
          <Link href={deepLinks.order(order.id, { highlight: 'tickets' })}>
            View Tickets
          </Link>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// Example 8: Membership Tier Selection
// ============================================================================

export function MembershipTiers() {
  const tiers = ['basic', 'premium', 'vip']
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {tiers.map(tier => (
        <div key={tier} className="card">
          <h3>{tier.toUpperCase()}</h3>
          
          {/* Link to membership page with tier pre-selected */}
          <Link href={deepLinks.membership(tier)}>
            Learn More
          </Link>
          
          {/* Direct link to checkout */}
          <Link 
            href={deepLinks.membershipCheckout(tier)}
            className="btn-primary"
          >
            Subscribe Now
          </Link>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// Example 9: News Article with Comment Deep Link
// ============================================================================

export function NewsArticleWithComments({ 
  articleSlug, 
  comments 
}: { 
  articleSlug: string
  comments: any[] 
}) {
  return (
    <div>
      <PageBreadcrumbs />
      
      <article>
        <h1>Article Title</h1>
        {/* Article content */}
      </article>
      
      <section id="comments">
        <h2>Comments</h2>
        {comments.map(comment => (
          <div key={comment.id} id={`comment-${comment.id}`}>
            <p>{comment.text}</p>
            
            {/* Generate shareable link to specific comment */}
            <button
              onClick={() => {
                const commentLink = deepLinks.newsArticle(articleSlug, {
                  comment: comment.id,
                })
                const fullUrl = `${window.location.origin}${commentLink}`
                navigator.clipboard.writeText(fullUrl)
              }}
            >
              Share Comment
            </button>
          </div>
        ))}
      </section>
    </div>
  )
}

// ============================================================================
// Example 10: Schedule with Filters
// ============================================================================

export function SchedulePage({ 
  selectedDate, 
  selectedFilter 
}: { 
  selectedDate?: string
  selectedFilter?: string 
}) {
  return (
    <div>
      <PageBreadcrumbs />
      
      <h1>Event Schedule</h1>
      
      {/* Filter buttons that update URL */}
      <div className="flex gap-2">
        <Link href={deepLinks.schedule({ filter: 'music' })}>
          Music Events
        </Link>
        <Link href={deepLinks.schedule({ filter: 'sports' })}>
          Sports Events
        </Link>
        <Link href={deepLinks.schedule({ date: '2024-07-15' })}>
          July 15, 2024
        </Link>
      </div>
      
      {/* Schedule content */}
    </div>
  )
}

// ============================================================================
// Example 11: Cart with Promo Code
// ============================================================================

export function PromoCodeLink({ promoCode }: { promoCode: string }) {
  // Generate cart link with promo code pre-applied
  const cartLink = deepLinks.cart({ promo: promoCode })
  
  return (
    <div className="promo-banner">
      <p>Use code <strong>{promoCode}</strong> for 20% off!</p>
      <Link href={cartLink} className="btn-primary">
        Apply & Shop
      </Link>
    </div>
  )
}

// ============================================================================
// Example 12: Artist Profile with Tab Navigation
// ============================================================================

export function ArtistProfile({ artistSlug }: { artistSlug: string }) {
  const tabs = ['about', 'events', 'media', 'merch']
  
  return (
    <div>
      <PageBreadcrumbs />
      
      <h1>Artist Name</h1>
      
      <nav className="tabs">
        {tabs.map(tab => (
          <Link 
            key={tab}
            href={deepLinks.artist(artistSlug, { tab })}
            className="tab"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Link>
        ))}
      </nav>
      
      {/* Tab content */}
    </div>
  )
}

// ============================================================================
// Example 13: Email Campaign Links
// ============================================================================

export function generateEmailCampaignLinks() {
  // Generate links for email campaigns with proper UTM tracking
  
  const summerFestLink = generateShareableLink('/events/summer-fest-2024', {
    source: 'email',
    medium: 'newsletter',
    campaign: 'summer-2024',
    content: 'hero-cta',
  })
  
  const membershipLink = generateShareableLink('/membership', {
    source: 'email',
    medium: 'newsletter',
    campaign: 'membership-drive',
    content: 'sidebar-banner',
  })
  
  return {
    summerFestLink: `https://gvteway.com${summerFestLink}`,
    membershipLink: `https://gvteway.com${membershipLink}`,
  }
}

// ============================================================================
// Example 14: Admin Dashboard with Quick Links
// ============================================================================

export function AdminDashboard({ recentOrders, upcomingEvents }: any) {
  return (
    <div>
      {/* Breadcrumbs automatically shown via AdminLayout */}
      
      <h1>Dashboard</h1>
      
      <section>
        <h2>Recent Orders</h2>
        {recentOrders.map((order: any) => (
          <div key={order.id}>
            <Link href={deepLinks.adminOrder(order.id)}>
              Order #{order.id.slice(0, 8)}
            </Link>
            {order.status === 'refund_requested' && (
              <Link 
                href={deepLinks.adminOrder(order.id, 'refund')}
                className="text-red-600"
              >
                Process Refund
              </Link>
            )}
          </div>
        ))}
      </section>
      
      <section>
        <h2>Upcoming Events</h2>
        {upcomingEvents.map((event: any) => (
          <div key={event.id}>
            <Link href={deepLinks.adminEvent(event.id, 'edit')}>
              {event.name}
            </Link>
          </div>
        ))}
      </section>
    </div>
  )
}
