/**
 * Event Layout Template
 * GHXSTSHIP Monochromatic Design System
 * Full-width event detail page with hero, lineup, schedule
 */

import * as React from "react";
import styles from './EventLayout.module.css';

export interface EventLayoutProps {
  /** Hero section content */
  hero: React.ReactNode;
  
  /** Navigation/header */
  header?: React.ReactNode;
  
  /** Event details section */
  details: React.ReactNode;
  
  /** Lineup section */
  lineup?: React.ReactNode;
  
  /** Schedule/timetable section */
  schedule?: React.ReactNode;
  
  /** Venue/map section */
  venue?: React.ReactNode;
  
  /** Gallery section */
  gallery?: React.ReactNode;
  
  /** FAQ section */
  faq?: React.ReactNode;
  
  /** Sticky CTA (ticket purchase) */
  cta?: React.ReactNode;
  
  /** Footer */
  footer?: React.ReactNode;
}

export const EventLayout: React.FC<EventLayoutProps> = ({
  hero,
  header,
  details,
  lineup,
  schedule,
  venue,
  gallery,
  faq,
  cta,
  footer,
}) => {
  return (
    <div className={styles.layout}>
      {/* Header */}
      {header && (
        <div className={styles.header}>
          {header}
        </div>
      )}
      
      {/* Hero Section */}
      <section className={styles.hero} aria-label="Event hero">
        {hero}
      </section>
      
      {/* Event Details */}
      <section className={styles.details} aria-label="Event details">
        {details}
      </section>
      
      {/* Lineup */}
      {lineup && (
        <section className={styles.lineup} aria-label="Lineup">
          {lineup}
        </section>
      )}
      
      {/* Schedule */}
      {schedule && (
        <section className={styles.schedule} aria-label="Schedule">
          {schedule}
        </section>
      )}
      
      {/* Venue */}
      {venue && (
        <section className={styles.venue} aria-label="Venue information">
          {venue}
        </section>
      )}
      
      {/* Gallery */}
      {gallery && (
        <section className={styles.gallery} aria-label="Photo gallery">
          {gallery}
        </section>
      )}
      
      {/* FAQ */}
      {faq && (
        <section className={styles.faq} aria-label="Frequently asked questions">
          {faq}
        </section>
      )}
      
      {/* Sticky CTA */}
      {cta && (
        <div className={styles.cta} role="complementary" aria-label="Ticket purchase">
          {cta}
        </div>
      )}
      
      {/* Footer */}
      {footer && (
        <footer className={styles.footer} role="contentinfo">
          {footer}
        </footer>
      )}
    </div>
  );
};
