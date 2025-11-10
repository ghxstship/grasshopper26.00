/**
 * TicketStub Component
 * GHXSTSHIP Entertainment Platform - Ticket stub visual
 * Geometric ticket stub with perforated edge
 */

import * as React from 'react';
import styles from './TicketStub.module.css';

export type TicketStubVariant = 'default' | 'vip' | 'ga';

export interface TicketStubProps {
  eventName: string;
  date: string;
  venue: string;
  section?: string;
  seat?: string;
  variant?: TicketStubVariant;
  className?: string;
}

export const TicketStub = React.forwardRef<HTMLDivElement, TicketStubProps>(
  (
    {
      eventName,
      date,
      venue,
      section,
      seat,
      variant = 'default',
      className = '',
    },
    ref
  ) => {
    const containerClassNames = [
      styles.stub,
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames}>
        <div className={styles.perforation} aria-hidden="true" />
        
        <div className={styles.content}>
          <div className={styles.header}>
            <span className={styles.eventName}>{eventName}</span>
          </div>
          
          <div className={styles.details}>
            <div className={styles.row}>
              <span className={styles.label}>DATE</span>
              <span className={styles.value}>{date}</span>
            </div>
            
            <div className={styles.row}>
              <span className={styles.label}>VENUE</span>
              <span className={styles.value}>{venue}</span>
            </div>
            
            {section && (
              <div className={styles.row}>
                <span className={styles.label}>SECTION</span>
                <span className={styles.value}>{section}</span>
              </div>
            )}
            
            {seat && (
              <div className={styles.row}>
                <span className={styles.label}>SEAT</span>
                <span className={styles.value}>{seat}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

TicketStub.displayName = 'TicketStub';
