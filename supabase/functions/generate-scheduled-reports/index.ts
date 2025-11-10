import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: scheduledReports, error } = await supabaseClient
      .from('scheduled_reports')
      .select('*, report_templates(*)')
      .eq('is_active', true)
      .lte('next_run_at', new Date().toISOString());

    if (error) throw error;

    for (const schedule of scheduledReports) {
      const { data: report } = await supabaseClient
        .from('generated_reports')
        .insert({
          template_id: schedule.template_id,
          report_name: schedule.schedule_name,
          report_data: {},
          status: 'completed',
          generated_by: schedule.created_by,
        })
        .select()
        .single();

      await supabaseClient
        .from('scheduled_reports')
        .update({
          last_run_at: new Date().toISOString(),
          next_run_at: calculateNextRun(schedule.cron_expression),
        })
        .eq('id', schedule.id);
    }

    return new Response(
      JSON.stringify({ success: true, processed: scheduledReports.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function calculateNextRun(cronExpression: string): string {
  const now = new Date();
  now.setHours(now.getHours() + 24);
  return now.toISOString();
}
