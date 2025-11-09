/**
 * ATLVS (Dragonfly26.00) Integration
 * 
 * This module provides comprehensive integration with the ATLVS production management platform
 * for syncing events, resources, business operations, and real-time updates.
 * 
 * Features:
 * - Bidirectional event sync
 * - Resource availability management
 * - Ticket sales analytics
 * - Webhook handling for real-time updates
 * - Artist and venue data synchronization
 */

const ATLVS_API_URL = process.env.ATLVS_API_URL || 'http://localhost:3000/api'
const ATLVS_API_KEY = process.env.ATLVS_API_KEY || ''
const ATLVS_WEBHOOK_SECRET = process.env.ATLVS_WEBHOOK_SECRET || ''

interface ATLVSEvent {
  id: string
  name: string
  startDate: string
  endDate?: string
  venue?: string
  status: string
  atlvsId?: string
}

interface ATLVSResource {
  id: string
  type: 'staff' | 'equipment' | 'venue'
  name: string
  availability: boolean
  metadata?: Record<string, any>
}

interface ATLVSArtist {
  id: string
  name: string
  genre?: string
  contactInfo?: {
    email?: string
    phone?: string
  }
}

interface ATLVSWebhookPayload {
  event: 'event.updated' | 'event.cancelled' | 'resource.updated' | 'artist.updated'
  data: any
  timestamp: string
  signature: string
}

/**
 * Sync event from Grasshopper to ATLVS production system
 */
export async function syncEventToATLVS(event: {
  id: string
  name: string
  start_date: string
  end_date?: string
  venue_name?: string
  status: string
}) {
  try {
    const response = await fetch(`${ATLVS_API_URL}/production/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ATLVS_API_KEY}`,
      },
      body: JSON.stringify({
        grasshopperId: event.id,
        name: event.name,
        startDate: event.start_date,
        endDate: event.end_date,
        venue: event.venue_name,
        status: event.status,
      }),
    })

    if (!response.ok) {
      throw new Error(`ATLVS sync failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to sync event to ATLVS:', error)
    throw error
  }
}

/**
 * Get available resources from ATLVS for event planning
 */
export async function getATLVSResources(eventDate: string): Promise<ATLVSResource[]> {
  try {
    const response = await fetch(
      `${ATLVS_API_URL}/production/resources?date=${eventDate}`,
      {
        headers: {
          'Authorization': `Bearer ${ATLVS_API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch ATLVS resources: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch ATLVS resources:', error)
    return []
  }
}

/**
 * Sync ticket sales data to ATLVS for analytics
 */
export async function syncTicketSalesToATLVS(data: {
  eventId: string
  ticketsSold: number
  revenue: number
  timestamp: string
}) {
  try {
    const response = await fetch(`${ATLVS_API_URL}/business/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ATLVS_API_KEY}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to sync sales to ATLVS: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to sync ticket sales to ATLVS:', error)
    throw error
  }
}

/**
 * Get analytics from ATLVS for cross-platform insights
 */
export async function getATLVSAnalytics(eventId: string) {
  try {
    const response = await fetch(
      `${ATLVS_API_URL}/intelligence/analytics?eventId=${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${ATLVS_API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch ATLVS analytics: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch ATLVS analytics:', error)
    return null
  }
}

/**
 * Sync event FROM ATLVS to Grasshopper (bidirectional sync)
 */
export async function syncEventFromATLVS(atlvsEventId: string) {
  try {
    const response = await fetch(
      `${ATLVS_API_URL}/production/events/${atlvsEventId}`,
      {
        headers: {
          'Authorization': `Bearer ${ATLVS_API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch ATLVS event: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to sync event from ATLVS:', error)
    throw error
  }
}

/**
 * Sync artist data with ATLVS
 */
export async function syncArtistToATLVS(artist: {
  id: string
  name: string
  genre?: string
  email?: string
  phone?: string
}) {
  try {
    const response = await fetch(`${ATLVS_API_URL}/production/artists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ATLVS_API_KEY}`,
      },
      body: JSON.stringify({
        grasshopperId: artist.id,
        name: artist.name,
        genre: artist.genre,
        contactInfo: {
          email: artist.email,
          phone: artist.phone,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to sync artist to ATLVS: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to sync artist to ATLVS:', error)
    throw error
  }
}

/**
 * Verify ATLVS webhook signature
 * Note: This function should only be called in server-side contexts (API routes, server components)
 */
export async function verifyATLVSWebhook(payload: string, signature: string): Promise<boolean> {
  if (!ATLVS_WEBHOOK_SECRET) {
    console.warn('ATLVS_WEBHOOK_SECRET not configured')
    return false
  }

  try {
    // Use Web Crypto API for edge runtime compatibility
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(ATLVS_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    )
    
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    return expectedSignature === signature
  } catch (error) {
    console.error('Webhook verification failed:', error)
    return false
  }
}

/**
 * Handle incoming ATLVS webhook
 */
export async function handleATLVSWebhook(payload: ATLVSWebhookPayload) {
  switch (payload.event) {
    case 'event.updated':
      // Sync updated event data from ATLVS
      return await syncEventFromATLVS(payload.data.id)
    
    case 'event.cancelled':
      // Handle event cancellation
      return { action: 'cancel_event', eventId: payload.data.id }
    
    case 'resource.updated':
      // Update resource availability
      return { action: 'update_resource', resourceId: payload.data.id }
    
    case 'artist.updated':
      // Sync artist data
      return { action: 'update_artist', artistId: payload.data.id }
    
    default:
      console.warn('Unknown ATLVS webhook event:', payload.event)
      return null
  }
}

/**
 * Get ATLVS connection status
 */
export async function getATLVSStatus(): Promise<{
  connected: boolean
  version?: string
  lastSync?: string
}> {
  try {
    const response = await fetch(`${ATLVS_API_URL}/health`, {
      headers: {
        'Authorization': `Bearer ${ATLVS_API_KEY}`,
      },
    })

    if (!response.ok) {
      return { connected: false }
    }

    const data = await response.json()
    return {
      connected: true,
      version: data.version,
      lastSync: data.lastSync,
    }
  } catch (error) {
    console.error('Failed to check ATLVS status:', error)
    return { connected: false }
  }
}
