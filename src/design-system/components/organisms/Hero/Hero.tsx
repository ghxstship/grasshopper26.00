/**
 * Hero Component
 * GHXSTSHIP Entertainment Platform - Full-screen hero section
 * ANTON typography, duotone/B&W backgrounds, geometric overlays
 */

import * as React from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';

export interface HeroProps {
  title: string;
  tagline?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  ctaText?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  variant?: 'black' | 'white';
  className?: string;
}

export const Hero = React.forwardRef<HTMLElement, HeroProps>(
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
        {backgroundVideo && (
          <div className={styles.backgroundVideo}>
            <video
              autoPlay
              loop
              muted
              playsInline
              className={styles.video}
              aria-hidden="true"
            >
              <source src={backgroundVideo} type="video/mp4" />
            </video>
            <div className={styles.videoOverlay} aria-hidden="true" />
          </div>
        )}

        {!backgroundVideo && backgroundImage && (
          <div className={styles.backgroundImage}>
            <Image
              src={backgroundImage}
              alt=""
              fill
              priority
              className={styles.image}
              sizes="100vw"
            />
            <div className={styles.imageOverlay} aria-hidden="true" />
          </div>
        )}

        <div className={styles.geometricShapes} aria-hidden="true">
          <div className={styles.shape1} />
          <div className={styles.shape2} />
          <div className={styles.shape3} />
        </div>

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
                <a href={ctaHref} className={styles.cta}>
                  <span className={styles.ctaText}>{ctaText}</span>
                  <span className={styles.ctaArrow} aria-hidden="true">→</span>
                </a>
              ) : (
                <button onClick={onCtaClick} className={styles.cta}>
                  <span className={styles.ctaText}>{ctaText}</span>
                  <span className={styles.ctaArrow} aria-hidden="true">→</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className={styles.scrollIndicator} aria-hidden="true">
          <div className={styles.scrollLine} />
          <div className={styles.scrollArrow}>↓</div>
        </div>
      </section>
    );
  }
);

Hero.displayName = 'Hero';
