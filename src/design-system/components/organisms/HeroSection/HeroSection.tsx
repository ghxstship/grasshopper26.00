/**
 * HeroSection Component
 * Entertainment Platform - Full-screen bold composition
 * ANTON event name (120px), duotone/B&W background, geometric overlays
 */

import * as React from 'react';
import Image from 'next/image';
import styles from './HeroSection.module.css';

export interface HeroSectionProps {
  title: string;
  tagline?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  ctaText?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  variant?: 'black' | 'white';
  showScrollIndicator?: boolean;
  className?: string;
}

export const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  (
    {
      title,
      tagline,
      backgroundImage,
      backgroundVideo,
      ctaText,
      ctaHref,
      onCtaClick,
      variant = 'black',
      showScrollIndicator = true,
      className = '',
    },
    ref
  ) => {
    const classNames = [
      styles.hero,
      styles[variant],
      className,
    ].filter(Boolean).join(' ');

    return (
      <section ref={ref} className={classNames}>
        {/* Background Media */}
        <div className={styles.background}>
          {backgroundVideo ? (
            <video
              className={styles.backgroundVideo}
              autoPlay
              loop
              muted
              playsInline
              aria-hidden="true"
            >
              <source src={backgroundVideo} type="video/mp4" />
            </video>
          ) : backgroundImage ? (
            <Image
              src={backgroundImage}
              alt=""
              fill
              className={styles.backgroundImage}
              priority
              sizes="100vw"
            />
          ) : null}
          
          {/* Halftone overlay */}
          <div className={styles.halftoneOverlay} aria-hidden="true" />
          
          {/* Geometric shapes */}
          <div className={styles.geometricShapes} aria-hidden="true">
            <div className={styles.shape1} />
            <div className={styles.shape2} />
            <div className={styles.shape3} />
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h1 className={styles.title}>
            {title}
          </h1>
          
          {tagline && (
            <p className={styles.tagline}>
              {tagline}
            </p>
          )}

          {ctaText && (
            <div className={styles.ctaContainer}>
              {ctaHref ? (
                <a
                  href={ctaHref}
                  className={styles.cta}
                  onClick={onCtaClick}
                >
                  <span className={styles.ctaText}>{ctaText}</span>
                  <span className={styles.ctaArrow} aria-hidden="true">▶</span>
                </a>
              ) : (
                <button
                  className={styles.cta}
                  onClick={onCtaClick}
                  type="button"
                >
                  <span className={styles.ctaText}>{ctaText}</span>
                  <span className={styles.ctaArrow} aria-hidden="true">▶</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <div className={styles.scrollIndicator} aria-hidden="true">
            <div className={styles.scrollArrow}>▼</div>
          </div>
        )}
      </section>
    );
  }
);

HeroSection.displayName = 'HeroSection';
