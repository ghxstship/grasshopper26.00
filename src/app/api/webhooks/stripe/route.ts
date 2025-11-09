import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { generateTicketQRCode } from '@/lib/tickets/qr-generator'
import { sendOrderConfirmationEmail } from '@/lib/email/send'
import { syncTicketSalesToATLVS } from '@/lib/integrations/atlvs'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Update order status
        await supabase
          .from('orders')
          .update({ 
            status: 'completed',
            stripe_payment_intent_id: session.payment_intent as string,
            stripe_customer_id: session.customer as string,
          })
          .eq('id', session.metadata?.order_id)

        // Get order with tickets and user info
        const { data: order } = await supabase
          .from('orders')
          .select(`
            *,
            tickets(*),
            events(name, start_date, venue_name)
          `)
          .eq('id', session.metadata?.order_id)
          .single()

        if (order) {
          // Generate QR codes for tickets
          if (order.tickets && order.tickets.length > 0) {
            for (const ticket of order.tickets) {
              try {
                // Generate actual QR code
                const qrCodeData = await generateTicketQRCode(ticket.id);
                
                // Update ticket with QR code and activate it
                await supabase
                  .from('tickets')
                  .update({ 
                    qr_code: qrCodeData,
                    status: 'active'
                  })
                  .eq('id', ticket.id);

                // Update ticket type sold count
                await supabase.rpc('increment_ticket_sold', {
                  ticket_type_id: ticket.ticket_type_id
                });
              } catch (error) {
                console.error(`Failed to generate QR for ticket ${ticket.id}:`, error);
              }
            }
          }

          // Send confirmation email
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
            
            if (userData?.user?.email) {
              await sendOrderConfirmationEmail({
                to: userData.user.email,
                customerName: userData.user.user_metadata?.name || 'Customer',
                orderNumber: order.id.slice(0, 8).toUpperCase(),
                eventName: 'Event', // TODO: Get actual event name from order
                ticketCount: 1, // TODO: Get actual ticket count
                totalAmount: parseFloat(order.total_amount),
              });
            }
          } catch (error) {
            console.error('Failed to send confirmation email:', error);
          }

          // Sync to ATLVS
          try {
            if (order.event_id) {
              await syncTicketSalesToATLVS({
                eventId: order.event_id,
                ticketsSold: order.tickets?.length || 0,
                revenue: order.total_amount,
                timestamp: new Date().toISOString(),
              });
            }
          } catch (error) {
            console.error('Failed to sync to ATLVS:', error);
          }
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        
        await supabase
          .from('orders')
          .update({ status: 'refunded' })
          .eq('stripe_payment_intent_id', charge.payment_intent as string)

        // Cancel associated tickets
        const { data: order } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_payment_intent_id', charge.payment_intent as string)
          .single()

        if (order) {
          await supabase
            .from('tickets')
            .update({ status: 'cancelled' })
            .eq('order_id', order.id)
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
