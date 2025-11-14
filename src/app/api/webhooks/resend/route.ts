import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/design-system/utils/logger-helpers';

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
        logger.info('Email delivered', { recipient: data.to, emailId: data.email_id, context: 'resend-webhook' });
        break;

      case 'email.bounced':
        logger.error('Email bounced', new Error('Email bounced'), { recipient: data.to, bounce: data.bounce, context: 'resend-webhook' });
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
        logger.warn('Spam complaint received', { recipient: data.to, context: 'resend-webhook' });
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
        logger.info('Email opened', { recipient: data.to, emailId: data.email_id, context: 'resend-webhook' });
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
        logger.info('Link clicked in email', { recipient: data.to, link: data.link, emailId: data.email_id, context: 'resend-webhook' });
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
        logger.info('Unhandled webhook event', { eventType: type, context: 'resend-webhook' });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Resend webhook error', error as Error, { context: 'resend-webhook' });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
