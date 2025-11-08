/**
 * ATLVS (Dragonfly26.00) Integration
 * 
 * This module provides integration with the ATLVS production management platform
 * for syncing events, resources, and business operations.
 */

const ATLVS_API_URL = process.env.ATLVS_API_URL || 'http://localhost:3000/api'
const ATLVS_API_KEY = process.env.ATLVS_API_KEY || ''

interface ATLVSEvent {
  id: string
  name: string
  startDate: string
  endDate?: string
  venue?: string
  status: string
}

interface ATLVSResource {
  id: string
  type: 'staff' | 'equipment' | 'venue'
  name: string
  availability: boolean
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
