import { NextRequest, NextResponse } from 'next/server'
import { verifyATLVSWebhook, handleATLVSWebhook } from '@/lib/integrations/atlvs'
import { createClient } from '@/lib/supabase/server'

/**
 * ATLVS Webhook Handler
 * 
 * Receives real-time updates from ATLVS (Dragonfly26.00) platform
 * for events, resources, and artist data synchronization.
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-atlvs-signature') || ''

    // Verify webhook signature
    if (!verifyATLVSWebhook(rawBody, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    // Parse payload
    const payload = JSON.parse(rawBody)

    // Handle webhook event
    const result = await handleATLVSWebhook(payload)

    if (!result) {
      return NextResponse.json(
        { error: 'Unknown event type' },
        { status: 400 }
      )
    }

    // Process the result based on action type
    const supabase = await createClient()

    switch (result.action) {
      case 'cancel_event':
        // Update event status in database
        await supabase
          .from('events')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('id', result.eventId)
        break

      case 'update_resource':
        // Update resource availability
        await supabase
          .from('resources')
          .update({ updated_at: new Date().toISOString() })
          .eq('atlvs_id', result.resourceId)
        break

      case 'update_artist':
        // Sync artist data
        await supabase
          .from('artists')
          .update({ updated_at: new Date().toISOString() })
          .eq('atlvs_id', result.artistId)
        break
    }

    return NextResponse.json({ success: true, action: result.action })
  } catch (error) {
    console.error('ATLVS webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Disable body parsing to get raw body for signature verification
export const runtime = 'edge'
