/**
 * Landing Layout Template
 * GHXSTSHIP Monochromatic Design System
 * Homepage/landing page with hero, sections, and CTAs
 */

import * as React from "react";
import styles from './LandingLayout.module.css';

export interface LandingLayoutProps {
  /** Navigation header */
  header?: React.ReactNode;
  
  /** Hero section */
  hero: React.ReactNode;
  
  /** Featured events section */
  featuredEvents?: React.ReactNode;
  
  /** Featured artists section */
  featuredArtists?: React.ReactNode;
  
  /** Membership tiers section */
  membershipTiers?: React.ReactNode;
  
  /** News/blog section */
  news?: React.ReactNode;
  
  /** Newsletter signup */
  newsletter?: React.ReactNode;
  
  /** Additional sections */
  children?: React.ReactNode;
  
  /** Footer */
  footer?: React.ReactNode;
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({
  header,
  hero,
  featuredEvents,
  featuredArtists,
  membershipTiers,
  news,
  newsletter,
  children,
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
      <section className={styles.hero} aria-label="Hero">
        {hero}
      </section>
      
      {/* Featured Events */}
      {featuredEvents && (
        <section className={styles.section} aria-label="Featured events">
          {featuredEvents}
        </section>
      )}
      
      {/* Featured Artists */}
      {featuredArtists && (
        <section className={`${styles.section} ${styles.sectionInverted}`} aria-label="Featured artists">
          {featuredArtists}
        </section>
      )}
      
      {/* Membership Tiers */}
      {membershipTiers && (
        <section className={styles.section} aria-label="Membership tiers">
          {membershipTiers}
        </section>
      )}
      
      {/* News */}
      {news && (
        <section className={`${styles.section} ${styles.sectionInverted}`} aria-label="Latest news">
          {news}
        </section>
      )}
      
      {/* Additional Content */}
      {children}
      
      {/* Newsletter */}
      {newsletter && (
        <section className={styles.newsletter} aria-label="Newsletter signup">
          {newsletter}
        </section>
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
