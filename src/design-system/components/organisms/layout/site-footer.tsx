import * as React from 'react';
import { FooterColumn } from '../../molecules/FooterColumn';
import { SocialLinks } from '../../molecules/SocialLinks';
import styles from './site-footer.module.css';

export interface SiteFooterProps {
  className?: string;
}

const FOOTER_COLUMNS = [
  {
    title: 'BROWSE EVENTS',
    links: [
      { label: 'Artists', href: '/artists' },
      { label: 'Venues', href: '/venues' },
      { label: 'Calendar', href: '/events' },
    ],
  },
  {
    title: 'MERCHANDISE',
    links: [
      { label: 'Gift Cards', href: '/shop/gift-cards' },
      { label: 'Shipping Info', href: '/shipping' },
    ],
  },
  {
    title: 'ABOUT US',
    links: [
      { label: 'News', href: '/news' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Cookie Policy', href: '/legal/cookies' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  },
] as const;

const SOCIAL_LINKS = [
  { platform: 'facebook' as const, url: 'https://facebook.com/gvteway.xyz' },
  { platform: 'instagram' as const, url: 'https://instagram.com/gvteway.xyz' },
  { platform: 'tiktok' as const, url: 'https://tiktok.com/@gvteway.xyz' },
  { platform: 'youtube' as const, url: 'https://youtube.com/@gvteway.xyz' },
];

/**
 * SiteFooter - Compact footer for GVTEWAY
 * Built with atomic design: FooterColumn and SocialLinks molecules
 * GHXSTSHIP monochromatic design - COMPACT, not half viewport
 */
export const SiteFooter: React.FC<SiteFooterProps> = ({ className = '' }) => {
  return (
    <footer className={`${styles.footer} ${className}`}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn
              key={column.title}
              title={column.title}
              links={column.links}
            />
          ))}
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <p className={styles.tagline}>
            Experience live music and entertainment like never before.
          </p>
          <SocialLinks links={SOCIAL_LINKS} size="md" variant="horizontal" />
        </div>

        <div className={styles.divider} />

        <div className={styles.copyright}>
          <p>© {new Date().getFullYear()} GVTEWAY. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
};
