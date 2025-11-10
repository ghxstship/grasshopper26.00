/**
 * SocialLinks Component
 * GHXSTSHIP Entertainment Platform - Social Media Links
 * Custom B&W geometric social icons
 */

import * as React from 'react';
import styles from './SocialLinks.module.css';

export interface SocialLink {
  platform: 'spotify' | 'instagram' | 'twitter' | 'facebook' | 'youtube' | 'soundcloud' | 'tiktok';
  url: string;
  label?: string;
}

export interface SocialLinksProps {
  links: SocialLink[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

const socialIcons: Record<SocialLink['platform'], string> = {
  spotify: '♫',
  instagram: '◉',
  twitter: '◆',
  facebook: '◼',
  youtube: '▶',
  soundcloud: '◈',
  tiktok: '♪',
};

const socialLabels: Record<SocialLink['platform'], string> = {
  spotify: 'Spotify',
  instagram: 'Instagram',
  twitter: 'Twitter',
  facebook: 'Facebook',
  youtube: 'YouTube',
  soundcloud: 'SoundCloud',
  tiktok: 'TikTok',
};

export const SocialLinks = React.forwardRef<HTMLDivElement, SocialLinksProps>(
  ({ links, size = 'md', variant = 'horizontal', className = '' }, ref) => {
    const containerClassNames = [
      styles.container,
      styles[variant],
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames} aria-label="Social media links">
        {links.map((link) => (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            aria-label={link.label || `${socialLabels[link.platform]}`}
          >
            <span className={styles.icon} aria-hidden="true">
              {socialIcons[link.platform]}
            </span>
          </a>
        ))}
      </div>
    );
  }
);

SocialLinks.displayName = 'SocialLinks';
