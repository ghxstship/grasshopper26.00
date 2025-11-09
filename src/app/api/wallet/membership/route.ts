import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateAppleMembershipPass,
  generateGoogleMembershipPass,
  generateQRCodeData,
} from '@/lib/integrations/wallet'

/**
 * Generate wallet pass for membership card
 * 
 * POST /api/wallet/membership
 * Body: { userId: string, platform: 'apple' | 'google' }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, platform } = await request.json()

    if (!userId || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, platform' },
        { status: 400 }
      )
    }

    // Get membership details from database
    const supabase = await createClient()
    const { data: membership, error } = await supabase
      .from('memberships')
      .select(`
        *,
        user:user_profiles(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error || !membership) {
      return NextResponse.json(
        { error: 'Active membership not found' },
        { status: 404 }
      )
    }

    // Generate QR code
    const qrCode = generateQRCodeData(membership.id, 'membership')

    // Prepare pass data
    const passData = {
      memberId: membership.id,
      memberName: membership.user.display_name || membership.user.username,
      memberEmail: membership.user.email,
      membershipTier: membership.tier || 'Standard',
      memberSince: membership.created_at,
      expiryDate: membership.expires_at,
      qrCode,
    }

    // Generate pass based on platform
    let passUrl: string
    if (platform === 'apple') {
      passUrl = await generateAppleMembershipPass(passData)
    } else if (platform === 'google') {
      passUrl = await generateGoogleMembershipPass(passData)
    } else {
      return NextResponse.json(
        { error: 'Invalid platform. Must be "apple" or "google"' },
        { status: 400 }
      )
    }

    // Store QR code in database for verification
    await supabase
      .from('memberships')
      .update({ qr_code: qrCode })
      .eq('id', membership.id)

    return NextResponse.json({
      success: true,
      passUrl,
      platform,
    })
  } catch (error) {
    console.error('Membership pass generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate membership pass' },
      { status: 500 }
    )
  }
}
