'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export interface FooterColumn {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}

export interface FooterProps {
  /** Logo text or brand name */
  logoText?: string;
  /** Logo link destination */
  logoHref?: string;
  /** Footer columns */
  columns?: FooterColumn[];
  /** Social media links */
  socialLinks?: Array<{
    label: string;
    href: string;
    icon: string;
  }>;
  /** Show newsletter signup */
  showNewsletter?: boolean;
  /** Newsletter submit handler */
  onNewsletterSubmit?: (email: string) => void;
  /** Copyright text */
  copyrightText?: string;
  /** Legal links */
  legalLinks?: Array<{
    label: string;
    href: string;
  }>;
  /** Additional CSS class */
  className?: string;
}

/**
 * Footer Organism - GHXSTSHIP Design System
 * 
 * Site footer with:
 * - ANTON logo typography
 * - BEBAS NEUE column headers
 * - SHARE TECH body links
 * - Thick 3px borders and dividers
 * - Geometric social media icons
 * - Newsletter signup form
 * - Monochromatic color scheme
 * 
 * @example
 * ```tsx
 * <Footer
 *   logoText="GVTEWAY"
 *   columns={[
 *     {
 *       title: 'EVENTS',
 *       links: [
 *         { label: 'Upcoming', href: '/events' },
 *         { label: 'Past Events', href: '/events/past' },
 *       ],
 *     },
 *   ]}
 *   showNewsletter
 * />
 * ```
 */
export const Footer: React.FC<FooterProps> = ({
  logoText = 'GVTEWAY',
  logoHref = '/',
  columns = [
    {
      title: 'EVENTS',
      links: [
        { label: 'Upcoming', href: '/events' },
        { label: 'Past Events', href: '/events/past' },
        { label: 'Calendar', href: '/calendar' },
      ],
    },
    {
      title: 'ARTISTS',
      links: [
        { label: 'Browse All', href: '/artists' },
        { label: 'Featured', href: '/artists/featured' },
        { label: 'Genres', href: '/genres' },
      ],
    },
    {
      title: 'SUPPORT',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'COMPANY',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press', href: '/press' },
      ],
    },
  ],
  socialLinks = [
    { label: 'Instagram', href: 'https://instagram.com', icon: 'IG' },
    { label: 'Twitter', href: 'https://twitter.com', icon: 'X' },
    { label: 'Facebook', href: 'https://facebook.com', icon: 'FB' },
    { label: 'YouTube', href: 'https://youtube.com', icon: 'YT' },
  ],
  showNewsletter = true,
  onNewsletterSubmit,
  copyrightText = `© ${new Date().getFullYear()} GVTEWAY. ALL RIGHTS RESERVED.`,
  legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
  className = '',
}) => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNewsletterSubmit && email) {
      onNewsletterSubmit(email);
      setEmail('');
    }
  };

  return (
    <footer className={`${styles.footer} ${className}`}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {columns.map((column) => (
            <div key={column.title} className={styles.column}>
              <h3 className={styles.columnTitle}>{column.title}</h3>
              {column.links.map((link) => (
                <Link key={link.href} href={link.href} className={styles.columnLink}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          {showNewsletter && (
            <div className={styles.newsletter}>
              <h3 className={styles.newsletterTitle}>STAY UPDATED</h3>
              <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  placeholder="YOUR EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.newsletterInput}
                  required
                />
                <button type="submit" className={styles.newsletterButton}>
                  SUBSCRIBE
                </button>
              </form>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <Link href={logoHref} className={styles.logo}>
            {logoText}
          </Link>

          <div className={styles.social}>
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        {legalLinks.length > 0 && (
          <div className={styles.legalLinks}>
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.legalLink}>
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <p className={styles.copyright}>{copyrightText}</p>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
