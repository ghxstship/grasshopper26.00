'use client';

import { Calendar, MapPin, Users, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface MemberEventsProps {
  events: any[];
  membership: any;
}

export function MemberEvents({ events, membership }: MemberEventsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((memberEvent) => {
        const event = memberEvent.events;
        const eventDate = new Date(event.start_date);
        const isEligible = membership.membership_tiers.tier_level >= memberEvent.min_tier_level;
        
        return (
          <div
            key={memberEvent.id}
            className={`border-3 border-black ${
              isEligible ? 'bg-white' : 'bg-grey-100'
            }`}
          >
            {event.hero_image_url && (
              <div className="relative h-48 border-b-3 border-black">
                <Image
                  src={event.hero_image_url}
                  alt={event.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 font-share-tech-mono text-xs uppercase tracking-wider">
                  <Lock className="inline h-3 w-3 mr-1" />
                  Members Only
                </div>
              </div>
            )}
            <div className="p-6">
              <h3 className="font-bebas-neue text-2xl uppercase tracking-wide mb-3">
                {event.name}
              </h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-grey-600">
                  <Calendar className="h-4 w-4" />
                  <span className="font-share-tech-mono">
                    {eventDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {event.venue_name && (
                  <div className="flex items-center gap-2 text-grey-600">
                    <MapPin className="h-4 w-4" />
                    <span className="font-share-tech">{event.venue_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-grey-600">
                  <Users className="h-4 w-4" />
                  <span className="font-share-tech-mono text-xs uppercase tracking-wider">
                    {memberEvent.capacity ? `${memberEvent.capacity} Spots` : 'Limited Capacity'}
                  </span>
                </div>
              </div>
              
              {memberEvent.description && (
                <p className="font-share-tech text-sm text-grey-700 mb-4 line-clamp-2">
                  {memberEvent.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t-2 border-black">
                <span className="font-share-tech-mono text-xs uppercase tracking-wider text-grey-600">
                  {memberEvent.registration_status === 'open' ? 'Registration Open' : 'Coming Soon'}
                </span>
                {isEligible && memberEvent.registration_status === 'open' && (
                  <Link
                    href={`/portal/events/${memberEvent.id}/register`}
                    className="border-2 border-black px-4 py-2 font-share-tech-mono text-sm uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                  >
                    Register →
                  </Link>
                )}
                {!isEligible && (
                  <span className="font-share-tech-mono text-xs uppercase tracking-wider text-red-600">
                    Tier {memberEvent.min_tier_level}+ Required
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
