/**
 * Detail View Template
 * Standardized layout for public-facing detail pages
 * Used for: Event details, Artist details, News articles, Product details
 */

'use client';

import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent } from '@/design-system/components/atoms/card';
import { ChevronLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import styles from './DetailViewTemplate.module.css';

export interface DetailViewBreadcrumbItem {
  label: string;
  href: string;
}

export interface DetailViewActionButton {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  disabled?: boolean;
}

export interface RelatedItem {
  id: string;
  title: string;
  image?: string;
  href: string;
}

export interface DetailViewTemplateProps {
  // Hero
  heroImage?: string;
  heroImageAlt?: string;
  title: string;
  subtitle?: string;
  metadata?: React.ReactNode;
  
  // Actions
  primaryAction?: DetailViewActionButton;
  secondaryActions?: DetailViewActionButton[];
  showShareButton?: boolean;
  onShare?: () => void;
  
  // Navigation
  breadcrumbs?: DetailViewBreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
  
  // Content
  children: React.ReactNode;
  
  // Sidebar (optional)
  sidebar?: React.ReactNode;
  showSidebar?: boolean;
  
  // Related Items
  relatedItems?: {
    title: string;
    items: RelatedItem[];
  };
  
  // Layout
  contentWidth?: 'narrow' | 'wide' | 'full';
}

export function DetailViewTemplate({
  heroImage,
  heroImageAlt,
  title,
  subtitle,
  metadata,
  primaryAction,
  secondaryActions,
  showShareButton = true,
  onShare,
  breadcrumbs,
  backHref,
  backLabel = 'Back',
  children,
  sidebar,
  showSidebar = true,
  relatedItems,
  contentWidth = 'wide',
}: DetailViewTemplateProps) {
  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    // Default share behavior
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className={styles.breadcrumbs}>
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className={styles.breadcrumbItem}>
              <Link href={crumb.href} className={styles.breadcrumbLink}>
                {crumb.label}
              </Link>
              {index < breadcrumbs.length - 1 && (
                <span className={styles.breadcrumbSeparator}>/</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Back Button */}
      {backHref && (
        <Link href={backHref} className={styles.backButton}>
          <ChevronLeft className={styles.backIcon} />
          {backLabel}
        </Link>
      )}

      {/* Hero Image */}
      {heroImage && (
        <div className={styles.heroImageWrapper}>
          <Image
            src={heroImage}
            alt={heroImageAlt || title}
            fill
            className={styles.heroImage}
            priority
          />
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {metadata && <div className={styles.metadata}>{metadata}</div>}
        </div>

        {/* Actions */}
        {(primaryAction || secondaryActions || showShareButton) && (
          <div className={styles.actions}>
            {secondaryActions && secondaryActions.map((action, index) => (
              action.href ? (
                <Button
                  key={index}
                  asChild
                  variant={action.variant || 'outline'}
                  disabled={action.disabled}
                  className={styles.actionButton}
                >
                  <Link href={action.href}>
                    {action.icon}
                    {action.label}
                  </Link>
                </Button>
              ) : (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || 'outline'}
                  disabled={action.disabled}
                  className={styles.actionButton}
                >
                  {action.icon}
                  {action.label}
                </Button>
              )
            ))}

            {showShareButton && (
              <Button
                onClick={handleShare}
                variant="outline"
                className={styles.shareButton}
              >
                <Share2 className={styles.buttonIcon} />
                Share
              </Button>
            )}

            {primaryAction && (
              primaryAction.href ? (
                <Button
                  asChild
                  variant={primaryAction.variant || 'default'}
                  disabled={primaryAction.disabled}
                  className={styles.primaryActionButton}
                >
                  <Link href={primaryAction.href}>
                    {primaryAction.icon}
                    {primaryAction.label}
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={primaryAction.onClick}
                  variant={primaryAction.variant || 'default'}
                  disabled={primaryAction.disabled}
                  className={styles.primaryActionButton}
                >
                  {primaryAction.icon}
                  {primaryAction.label}
                </Button>
              )
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        className={cn(
          styles.mainContent,
          showSidebar && sidebar && styles.mainContentWithSidebar,
          contentWidth === 'narrow' && styles.mainContentNarrow,
          contentWidth === 'full' && styles.mainContentFull
        )}
      >
        {/* Content Area */}
        <article className={styles.contentArea}>{children}</article>

        {/* Sidebar */}
        {showSidebar && sidebar && (
          <aside className={styles.sidebar}>{sidebar}</aside>
        )}
      </div>

      {/* Related Items */}
      {relatedItems && relatedItems.items.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>{relatedItems.title}</h2>
          <div className={styles.relatedGrid}>
            {relatedItems.items.map((item) => (
              <Link key={item.id} href={item.href} className={styles.relatedCard}>
                {item.image && (
                  <div className={styles.relatedImageWrapper}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className={styles.relatedImage}
                    />
                  </div>
                )}
                <p className={styles.relatedCardTitle}>{item.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
