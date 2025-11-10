/**
 * Membership Layout Template
 * GHXSTSHIP Monochromatic Design System
 * Membership tiers comparison and selection
 */

import * as React from "react";
import styles from './MembershipLayout.module.css';

export interface MembershipLayoutProps {
  /** Header/navigation */
  header?: React.ReactNode;
  
  /** Hero section */
  hero?: React.ReactNode;
  
  /** Tier comparison cards */
  tiers: React.ReactNode;
  
  /** Benefits breakdown */
  benefits?: React.ReactNode;
  
  /** FAQ section */
  faq?: React.ReactNode;
  
  /** Testimonials */
  testimonials?: React.ReactNode;
  
  /** CTA section */
  cta?: React.ReactNode;
  
  /** Footer */
  footer?: React.ReactNode;
  
  /** Show annual/monthly toggle */
  billingToggle?: React.ReactNode;
}

export const MembershipLayout: React.FC<MembershipLayoutProps> = ({
  header,
  hero,
  tiers,
  benefits,
  faq,
  testimonials,
  cta,
  footer,
  billingToggle,
}) => {
  return (
    <div className={styles.layout}>
      {/* Header */}
      {header && (
        <div className={styles.header}>
          {header}
        </div>
      )}
      
      {/* Hero */}
      {hero && (
        <section className={styles.hero} aria-label="Membership hero">
          {hero}
        </section>
      )}
      
      {/* Billing Toggle */}
      {billingToggle && (
        <div className={styles.billingToggle}>
          {billingToggle}
        </div>
      )}
      
      {/* Tiers */}
      <section className={styles.tiers} aria-label="Membership tiers">
        {tiers}
      </section>
      
      {/* Benefits */}
      {benefits && (
        <section className={styles.benefits} aria-label="Membership benefits">
          {benefits}
        </section>
      )}
      
      {/* Testimonials */}
      {testimonials && (
        <section className={styles.testimonials} aria-label="Member testimonials">
          {testimonials}
        </section>
      )}
      
      {/* FAQ */}
      {faq && (
        <section className={styles.faq} aria-label="Frequently asked questions">
          {faq}
        </section>
      )}
      
      {/* CTA */}
      {cta && (
        <section className={styles.cta} aria-label="Call to action">
          {cta}
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
