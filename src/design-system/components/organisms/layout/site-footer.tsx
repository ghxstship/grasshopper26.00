'use client';

import * as React from 'react';
import Link from 'next/link';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import styles from './site-footer.module.css';

export interface SiteFooterProps {
  className?: string;
}

const FOOTER_COLUMNS = [
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
] as const;

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://facebook.com', icon: 'FB' },
  { label: 'Twitter', href: 'https://twitter.com', icon: 'YT' },
] as const;

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
] as const;

/**
 * SiteFooter - Main footer for GVTEWAY
 * Composed using atomic design principles with Input and Button atoms
 * GHXSTSHIP monochromatic design with structured content sections
 */
export const SiteFooter: React.FC<SiteFooterProps> = ({ className = '' }) => {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Newsletter signup logic would go here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <footer className={`${styles.footer} ${className}`}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className={styles.column}>
              <h3 className={styles.columnTitle}>{column.title}</h3>
              <nav aria-label={`${column.title} links`}>
                {column.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={styles.columnLink}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}

          <div className={styles.newsletter}>
            <h3 className={styles.newsletterTitle}>STAY UPDATED</h3>
            <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
              <Input
                type="email"
                placeholder="YOUR EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.newsletterInput}
                aria-label="Email address for newsletter"
              />
              <Button
                type="submit"
                variant="filled"
                size="md"
                disabled={isSubmitting}
                className={styles.newsletterButton}
              >
                {isSubmitting ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
              </Button>
            </form>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <Link href="/" className={styles.logo} aria-label="GVTEWAY Home">
            GVTEWAY
          </Link>

          <div className={styles.social}>
            {SOCIAL_LINKS.map((link) => (
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

        <nav className={styles.legalLinks} aria-label="Legal links">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.legalLink}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className={styles.copyright}>
          © {new Date().getFullYear()} GVTEWAY. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
};
