'use client';

import * as React from 'react';
import Link from 'next/link';
import { Instagram, Music2, Youtube, Linkedin, Facebook } from 'lucide-react';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import styles from './site-footer.module.css';

export interface SiteFooterProps {
  className?: string;
}

const FOOTER_COLUMNS = [
  {
    title: 'Browse Events',
    links: [
      { label: 'Artists', href: '/artists' },
      { label: 'Venues', href: '/venues' },
      { label: 'Calendar', href: '/events' },
    ],
  },
  {
    title: 'Merchandise',
    links: [
      { label: 'Gift Cards', href: '/shop/gift-cards' },
      { label: 'Shipping Info', href: '/shipping' },
    ],
  },
  {
    title: 'About Us',
    links: [
      { label: 'News', href: '/news' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Cookie Policy', href: '/legal/cookies' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  },
] as const;

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://facebook.com/gvteway.xyz', Icon: Facebook },
  { label: 'Instagram', href: 'https://instagram.com/gvteway.xyz', Icon: Instagram },
  { label: 'TikTok', href: 'https://tiktok.com/@gvteway.xyz', Icon: Music2 },
  { label: 'YouTube', href: 'https://youtube.com/@gvteway.xyz', Icon: Youtube },
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
        {/* Top Section: Tagline and Social */}
        <div className={styles.topSection}>
          <div className={styles.taglineSection}>
            <p className={styles.tagline}>
              Experience live music and entertainment like never before.
            </p>
            <div className={styles.social}>
              {SOCIAL_LINKS.map((link) => {
                const IconComponent = link.Icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                  >
                    <IconComponent />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
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
        </div>

        <div className={styles.divider} />

        {/* Newsletter Section */}
        <div className={styles.newsletterSection}>
          <p className={styles.newsletterText}>
            Get the latest events, news, and exclusive offers.
          </p>
          <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
            <Input
              type="email"
              placeholder="Enter your email"
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
              aria-label="Subscribe to newsletter"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </Button>
          </form>
        </div>

        <div className={styles.divider} />

        {/* Bottom Section */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} GVTEWAY. All rights reserved.
          </p>
          <p className={styles.madeWith}>
            Made with <span className={styles.heart}>♥</span> for live music fans everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};
