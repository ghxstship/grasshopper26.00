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
        // Mark user email as invalid
        await supabase
          .from('user_profiles')
          .update({ 
            email_valid: false,
            email_bounce_reason: data.bounce?.type || 'unknown'
          })
          .eq('email', data.to);
        break;

      case 'email.complained':
        console.error(`Spam complaint from ${data.to}`);
        // Unsubscribe user from marketing emails
        await supabase
          .from('user_profiles')
          .update({ 
            email_notifications: false,
            marketing_emails: false,
            unsubscribed_at: new Date().toISOString()
          })
          .eq('email', data.to);
        break;

      case 'email.opened':
        console.log(`Email opened by ${data.to}`);
        // Track email engagement
        await supabase
          .from('email_logs')
          .update({ 
            opened_at: new Date().toISOString(),
            open_count: supabase.rpc('increment', { row_id: data.email_id })
          })
          .eq('email_id', data.email_id);
        break;

      case 'email.clicked':
        console.log(`Link clicked in email by ${data.to}`);
        // Track link clicks
        await supabase
          .from('email_logs')
          .update({ 
            clicked_at: new Date().toISOString(),
            click_count: supabase.rpc('increment', { row_id: data.email_id }),
            clicked_links: supabase.rpc('array_append', { 
              arr: 'clicked_links', 
              elem: data.link 
            })
          })
          .eq('email_id', data.email_id);
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
