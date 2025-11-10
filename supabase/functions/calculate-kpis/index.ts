import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { event_id } = await req.json();

    if (!event_id) {
      return new Response(
        JSON.stringify({ error: 'event_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call stored procedure to calculate all core KPIs
    const { data, error } = await supabaseClient.rpc('calculate_all_core_kpis', {
      p_event_id: event_id,
    });

    if (error) throw error;

    // Insert calculated values
    for (const result of data) {
      await supabaseClient.rpc('upsert_kpi_data_point', {
        p_metric_code: result.metric_code,
        p_event_id: event_id,
        p_value: result.metric_value,
        p_measured_at: result.calculated_at,
        p_data_source: 'automated',
      });
    }

    // Refresh materialized views
    await supabaseClient.rpc('refresh_all_kpi_views');

    return new Response(
      JSON.stringify({ success: true, calculated: data.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
