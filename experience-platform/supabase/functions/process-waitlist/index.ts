import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WaitlistEntry {
  waitlist_id: string;
  user_id: string;
  email: string;
  quantity: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { ticketTypeId } = await req.json();

    if (!ticketTypeId) {
      return new Response(
        JSON.stringify({ error: 'ticketTypeId is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check available tickets
    const { data: ticketType, error: ticketError } = await supabaseClient
      .from('ticket_types')
      .select('quantity_available, quantity_sold')
      .eq('id', ticketTypeId)
      .single();

    if (ticketError) {
      throw ticketError;
    }

    const availableQuantity = ticketType.quantity_available - ticketType.quantity_sold;

    if (availableQuantity <= 0) {
      return new Response(
        JSON.stringify({ message: 'No tickets available', processed: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Process waitlist
    const { data: waitlistEntries, error: waitlistError } = await supabaseClient
      .rpc('process_waitlist', {
        p_ticket_type_id: ticketTypeId,
        p_available_quantity: availableQuantity,
      });

    if (waitlistError) {
      throw waitlistError;
    }

    // Send notification emails
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const appUrl = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://grasshopper.com';

    if (resendApiKey && waitlistEntries && waitlistEntries.length > 0) {
      for (const entry of waitlistEntries as WaitlistEntry[]) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'Grasshopper <notifications@grasshopper.com>',
              to: [entry.email],
              subject: 'Tickets Now Available!',
              html: `
                <h1>Great News!</h1>
                <p>Tickets are now available for the event you're waiting for!</p>
                <p>You have 24 hours to complete your purchase before your spot expires.</p>
                <p>Quantity reserved: ${entry.quantity}</p>
                <p><a href="${appUrl}/checkout?waitlist=${entry.waitlist_id}">Complete Your Purchase</a></p>
                <p>Don't miss out - these tickets won't last long!</p>
              `,
            }),
          });
        } catch (emailError) {
          console.error(`Failed to send email to ${entry.email}:`, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Waitlist processed successfully',
        processed: waitlistEntries?.length || 0,
        notified: waitlistEntries?.length || 0,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
