'use client';

import { Calendar, MapPin, Users, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './member-events.module.css';

interface MemberEventsProps {
  events: any[];
  membership: any;
}

export function MemberEvents({ events, membership }: MemberEventsProps) {
  return (
    <div className={styles.grid}>
      {events.map((memberEvent) => {
        const event = memberEvent.events;
        const eventDate = new Date(event.start_date);
        const isEligible = membership.membership_tiers.tier_level >= memberEvent.min_tier_level;
        
        return (
          <div
            key={memberEvent.id}
            className={`${styles.eventCard} ${
              isEligible ? styles.eventCardEligible : styles.eventCardIneligible
            }`}
          >
            {event.hero_image_url && (
              <div className={styles.eventImage}>
                <Image
                  src={event.hero_image_url}
                  alt={event.name}
                  fill
                  className="object-cover"
                />
                <div className={styles.membersBadge}>
                  <Lock className={styles.membersBadgeIcon} />
                  Members Only
                </div>
              </div>
            )}
            <div className={styles.eventContent}>
              <h3 className={styles.eventTitle}>
                {event.name}
              </h3>
              <div className={styles.eventMeta}>
                <div className={styles.metaItem}>
                  <Calendar className={styles.metaIcon} />
                  <span className={styles.metaText}>
                    {eventDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {event.venue_name && (
                  <div className={styles.metaItem}>
                    <MapPin className={styles.metaIcon} />
                    <span className={styles.metaText}>{event.venue_name}</span>
                  </div>
                )}
                <div className={styles.metaItem}>
                  <Users className={styles.metaIcon} />
                  <span className={styles.metaTextSmall}>
                    {memberEvent.capacity ? `${memberEvent.capacity} Spots` : 'Limited Capacity'}
                  </span>
                </div>
              </div>
              
              {memberEvent.description && (
                <p className={styles.eventDescription}>
                  {memberEvent.description}
                </p>
              )}

              <div className={styles.eventFooter}>
                <span className={styles.statusText}>
                  {memberEvent.registration_status === 'open' ? 'Registration Open' : 'Coming Soon'}
                </span>
                {isEligible && memberEvent.registration_status === 'open' && (
                  <Link
                    href={`/portal/events/${memberEvent.id}/register`}
                    className={styles.registerButton}
                  >
                    Register →
                  </Link>
                )}
                {!isEligible && (
                  <span className={styles.tierRequirement}>
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
