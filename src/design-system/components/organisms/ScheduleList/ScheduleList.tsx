/**
 * ScheduleList Organism
 * GHXSTSHIP Design System
 */

import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import styles from './ScheduleList.module.css';

export interface ScheduleEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  href: string;
}

export interface ScheduleListProps {
  events: ScheduleEvent[];
}

export function ScheduleList({ events }: ScheduleListProps) {
  return (
    <div className={styles.list}>
      {events.map((event) => (
        <Link key={event.id} href={event.href} className={styles.item}>
          <div className={styles.content}>
            <h3 className={styles.name}>{event.name}</h3>
            <div className={styles.meta}>
              <span className={styles.metaItem}>
                <Calendar className={styles.icon} />
                {event.date}
              </span>
              <span className={styles.metaItem}>
                <MapPin className={styles.icon} />
                {event.venue}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
