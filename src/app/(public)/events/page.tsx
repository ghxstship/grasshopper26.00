import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { EventsClient } from './events-client';

export const metadata: Metadata = {
  title: 'Events - GVTEWAY',
  description: 'Browse all upcoming events and experiences',
};

export default async function EventsPage() {
  const supabase = await createClient();
  
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true });

  return <EventsClient events={events || []} />;
}
