import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Resend webhook handler
 * Handles email delivery events (delivered, bounced, complained, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    const supabase = await createClient();

    // Log the webhook event
    await supabase.from('email_logs').insert({
      event_type: type,
      email_id: data.email_id,
      recipient: data.to,
      subject: data.subject,
      status: type,
      metadata: data,
      created_at: new Date().toISOString(),
    });

    // Handle specific event types
    switch (type) {
      case 'email.delivered':
        console.log(`Email delivered to ${data.to}`);
        break;

      case 'email.bounced':
        console.error(`Email bounced for ${data.to}:`, data.bounce);
        // TODO: Mark user email as invalid
        break;

      case 'email.complained':
        console.error(`Spam complaint from ${data.to}`);
        // TODO: Unsubscribe user from emails
        break;

      case 'email.opened':
        console.log(`Email opened by ${data.to}`);
        // TODO: Track email engagement
        break;

      case 'email.clicked':
        console.log(`Link clicked in email by ${data.to}`);
        // TODO: Track link clicks
        break;

      default:
        console.log(`Unhandled webhook event: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Resend webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
