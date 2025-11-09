import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateAppleWalletPass,
  generateGoogleWalletPass,
  generateQRCodeData,
} from '@/lib/integrations/wallet'

/**
 * Generate wallet pass for event ticket
 * 
 * POST /api/wallet/ticket
 * Body: { ticketId: string, platform: 'apple' | 'google' }
 */
export async function POST(request: NextRequest) {
  try {
    const { ticketId, platform } = await request.json()

    if (!ticketId || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: ticketId, platform' },
        { status: 400 }
      )
    }

    // Get ticket details from database
    const supabase = await createClient()
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        event:events(*),
        user:user_profiles(*)
      `)
      .eq('id', ticketId)
      .single()

    if (error || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Generate QR code
    const qrCode = generateQRCodeData(ticketId, 'ticket')

    // Prepare pass data
    const passData = {
      ticketId: ticket.id,
      eventName: ticket.event.name,
      eventDate: ticket.event.start_date,
      venueName: ticket.event.venue_name || 'TBA',
      venueAddress: ticket.event.venue_address,
      ticketType: ticket.ticket_type || 'General Admission',
      seatInfo: ticket.seat_info,
      price: ticket.price,
      qrCode,
      customerName: ticket.user.display_name || ticket.user.username,
      customerEmail: ticket.user.email,
    }

    // Generate pass based on platform
    let passUrl: string
    if (platform === 'apple') {
      passUrl = await generateAppleWalletPass(passData)
    } else if (platform === 'google') {
      passUrl = await generateGoogleWalletPass(passData)
    } else {
      return NextResponse.json(
        { error: 'Invalid platform. Must be "apple" or "google"' },
        { status: 400 }
      )
    }

    // Store QR code in database for verification
    await supabase
      .from('tickets')
      .update({ qr_code: qrCode })
      .eq('id', ticketId)

    return NextResponse.json({
      success: true,
      passUrl,
      platform,
    })
  } catch (error) {
    console.error('Wallet pass generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate wallet pass' },
      { status: 500 }
    )
  }
}
