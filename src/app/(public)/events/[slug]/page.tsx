import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EventDetailClient } from './event-detail-client';

interface EventDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select('name, description')
    .eq('slug', slug)
    .single();

  if (!event) {
    return {
      title: 'Event Not Found | GVTEWAY',
    };
  }

  return {
    title: `${event.name} | GVTEWAY`,
    description: event.description || `Get tickets for ${event.name}`,
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      ticket_types (
        id,
        name,
        description,
        price,
        quantity_available,
        quantity_sold,
        sale_start_date,
        sale_end_date,
        max_per_order,
        perks
      ),
      event_artists (
        artist:artists (
          id,
          name,
          slug,
          bio,
          genre_tags,
          profile_image_url
        ),
        headliner,
        performance_order
      )
    `)
    .eq('slug', slug)
    .single();

  if (error || !event) {
    notFound();
  }

  return <EventDetailClient event={event} />;
}
