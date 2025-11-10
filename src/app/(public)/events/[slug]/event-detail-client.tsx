'use client';

import { DetailViewTemplate } from '@/design-system/components/templates';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';

export function EventDetailClient({ event }: { event: any }) {
  return (
    <DetailViewTemplate
      breadcrumbs={[
        { label: 'Events', href: '/events' },
        { label: event.name, href: `/events/${event.slug}` },
      ]}
      heroImage={event.hero_image_url}
      title={event.name}
      subtitle={format(new Date(event.start_date), 'PPP')}
      primaryAction={{ label: 'Get Tickets', href: `/events/${event.slug}/tickets` }}
      secondaryActions={[
        { label: 'Share', onClick: () => navigator.share({ title: event.name, url: window.location.href }) },
      ]}
      sidebar={
        <div>
          <h3>Event Details</h3>
          <div><Calendar /> {format(new Date(event.start_date), 'PPP')}</div>
          <div><MapPin /> {event.venue?.name}</div>
          <div><Users /> {event.capacity} capacity</div>
        </div>
      }
    >
      <div dangerouslySetInnerHTML={{ __html: event.description }} />
    </DetailViewTemplate>
  );
}
