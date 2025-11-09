'use client';

import { Calendar, MapPin, Ticket } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface UpcomingEventsProps {
  tickets: any[];
}

export function UpcomingEvents({ tickets }: UpcomingEventsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tickets.map((ticket) => {
        const event = ticket.events;
        const eventDate = new Date(event.start_date);
        
        return (
          <Link
            key={ticket.id}
            href={`/events/${event.slug}`}
            className="border-3 border-black bg-white hover:translate-x-1 hover:-translate-y-1 transition-transform"
          >
            {event.hero_image_url && (
              <div className="relative h-48 border-b-3 border-black">
                <Image
                  src={event.hero_image_url}
                  alt={event.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bebas-neue text-xl uppercase tracking-wide mb-2 line-clamp-2">
                {event.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-grey-600">
                  <Calendar className="h-4 w-4" />
                  <span className="font-share-tech-mono">
                    {eventDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {event.venue_name && (
                  <div className="flex items-center gap-2 text-grey-600">
                    <MapPin className="h-4 w-4" />
                    <span className="font-share-tech text-sm line-clamp-1">
                      {event.venue_name}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-grey-600">
                  <Ticket className="h-4 w-4" />
                  <span className="font-share-tech-mono text-sm">
                    Ticket #{ticket.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t-2 border-black">
                <span className="font-share-tech-mono text-xs uppercase tracking-wider text-grey-600">
                  {ticket.status === 'active' ? '✓ Active' : ticket.status}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
