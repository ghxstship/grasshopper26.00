import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { MusicClient } from './music-client';

export const metadata: Metadata = {
  title: 'Artists - GVTEWAY',
  description: 'Browse all artists',
};

export default async function MusicPage() {
  const supabase = await createClient();
  
  const { data: artists } = await supabase
    .from('artists')
    .select('*')
    .order('name', { ascending: true });

  return <MusicClient artists={artists || []} />;
}
