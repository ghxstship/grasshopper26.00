/**
 * Site Footer Component
 * Main footer for public-facing pages
 */

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube, Mail } from 'lucide-react';
import styles from './site-footer.module.css';

const footerLinks = {
  events: [
    { name: 'Browse Events', href: '/events' },
    { name: 'Artists', href: '/artists' },
    { name: 'Venues', href: '/venues' },
    { name: 'Calendar', href: '/schedule' },
  ],
  shop: [
    { name: 'Merchandise', href: '/shop' },
    { name: 'Gift Cards', href: '/shop/gift-cards' },
    { name: 'Shipping Info', href: '/legal/shipping' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'News', href: '/news' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/legal/privacy' },
    { name: 'Terms of Service', href: '/legal/terms' },
    { name: 'Cookie Policy', href: '/legal/cookies' },
    { name: 'Accessibility', href: '/legal/accessibility' },
  ],
};

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/gvteway', icon: Facebook },
  { name: 'Instagram', href: 'https://instagram.com/gvteway', icon: Instagram },
  { name: 'Twitter', href: 'https://twitter.com/gvteway', icon: Twitter },
  { name: 'YouTube', href: 'https://youtube.com/gvteway', icon: Youtube },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* Main Footer Content */}
      <div className={styles.content}>
        <div className={styles.grid}>
          {/* Brand Column */}
          <div className={styles.brandColumn}>
            <Link href="/" className={styles.brandLink}>
              <span className={styles.brandText}>
                GVTEWAY
              </span>
            </Link>
            <p className={styles.brandDescription}>
              Experience live music and entertainment like never before.
            </p>
            
            {/* Social Links */}
            <div className={styles.socialLinks}>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label={social.name}
                  >
                    <Icon className={styles.socialIcon} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Events Column */}
          <div>
            <h3 className={styles.columnTitle}>Events</h3>
            <ul className={styles.linkList}>
              {footerLinks.events.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={styles.linkItem}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className={styles.columnTitle}>Shop</h3>
            <ul className={styles.linkList}>
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={styles.linkItem}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className={styles.columnTitle}>Company</h3>
            <ul className={styles.linkList}>
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={styles.linkItem}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className={styles.columnTitle}>Legal</h3>
            <ul className={styles.linkList}>
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={styles.linkItem}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className={styles.newsletter}>
          <div className={styles.newsletterContent}>
            <div className={styles.newsletterText}>
              <h3 className={styles.newsletterTitle}>
                Stay in the Loop
              </h3>
              <p className={styles.newsletterDescription}>
                Get the latest events, news, and exclusive offers.
              </p>
            </div>
            <div className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Enter your email"
                className={styles.newsletterInput}
                aria-label="Email address"
              />
              <button className={styles.newsletterButton}>
                <Mail className={styles.newsletterIcon} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContent}>
          <div className={styles.bottomFlex}>
            <p className={styles.bottomText}>
              © {currentYear} GVTEWAY. All rights reserved.
            </p>
            <p className={styles.bottomText}>
              Made with ❤️ for live music fans everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
