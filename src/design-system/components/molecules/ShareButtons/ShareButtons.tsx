/**
 * ShareButtons Component
 * GHXSTSHIP Entertainment Platform - Social Share Buttons
 * Geometric share icons for social platforms
 */

import * as React from 'react';
import styles from './ShareButtons.module.css';

export interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  platforms?: ('twitter' | 'facebook' | 'linkedin' | 'email' | 'copy')[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export const ShareButtons = React.forwardRef<HTMLDivElement, ShareButtonsProps>(
  (
    {
      url,
      title,
      description,
      platforms = ['twitter', 'facebook', 'linkedin', 'email', 'copy'],
      size = 'md',
      variant = 'horizontal',
      className = '',
    },
    ref
  ) => {
    const [copied, setCopied] = React.useState(false);

    const handleShare = (platform: string) => {
      const encodedUrl = encodeURIComponent(url);
      const encodedTitle = encodeURIComponent(title);
      const encodedDescription = encodeURIComponent(description || '');

      const shareUrls: Record<string, string> = {
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      };

      if (platform === 'copy') {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
      }
    };

    const platformIcons: Record<string, string> = {
      twitter: '◆',
      facebook: '◼',
      linkedin: '◉',
      email: '✉',
      copy: copied ? '✓' : '◈',
    };

    const platformLabels: Record<string, string> = {
      twitter: 'TWITTER',
      facebook: 'FACEBOOK',
      linkedin: 'LINKEDIN',
      email: 'EMAIL',
      copy: copied ? 'COPIED!' : 'COPY LINK',
    };

    const containerClassNames = [
      styles.container,
      styles[variant],
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames}>
        <div className={styles.label}>SHARE</div>
        <div className={styles.buttons}>
          {platforms.map((platform) => (
            <button
              key={platform}
              className={`${styles.button} ${copied && platform === 'copy' ? styles.copied : ''}`}
              onClick={() => handleShare(platform)}
              aria-label={`Share on ${platformLabels[platform]}`}
            >
              <span className={styles.icon} aria-hidden="true">
                {platformIcons[platform]}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }
);

ShareButtons.displayName = 'ShareButtons';
