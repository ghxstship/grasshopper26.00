import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { HomeClient } from './home-client';

export const metadata: Metadata = {
  title: 'GVTEWAY - Exclusive Events & Experiences',
  description: 'Join GVTEWAY for exclusive access to premium events, artist experiences, and member benefits',
};

export default async function HomePage() {
  const supabase = await createClient();
  
  const { data: featuredEvents } = await supabase
    .from('events')
    .select('*')
    .eq('featured', true)
    .limit(6);

  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(8);

  return <HomeClient featuredEvents={featuredEvents || []} upcomingEvents={upcomingEvents || []} />;
}
