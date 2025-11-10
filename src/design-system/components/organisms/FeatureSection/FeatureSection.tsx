'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './FeatureSection.module.css';

export interface Feature {
  icon: string;
  text: string;
}

export interface FeatureSectionProps {
  /** Section title */
  title: string;
  /** Section description */
  description: string;
  /** Feature list */
  features?: Feature[];
  /** Media image URL */
  imageUrl?: string;
  /** Image alt text */
  imageAlt?: string;
  /** CTA button text */
  ctaText?: string;
  /** CTA button link */
  ctaHref?: string;
  /** Color variant */
  variant?: 'black' | 'white';
  /** Reverse layout */
  reverse?: boolean;
  /** Show geometric shapes */
  showShapes?: boolean;
  /** Additional CSS class */
  className?: string;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  description,
  features = [],
  imageUrl,
  imageAlt,
  ctaText,
  ctaHref,
  variant = 'white',
  reverse = false,
  showShapes = true,
  className = '',
}) => {
  const sectionClasses = [
    styles.section,
    variant === 'black' && styles.black,
    variant === 'white' && styles.white,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const gridClasses = [
    styles.grid,
    reverse && styles.reverse,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={sectionClasses}>
      {showShapes && (
        <div className={styles.shapes}>
          <div className={`${styles.shape} ${styles.shape1}`} />
          <div className={`${styles.shape} ${styles.shape2}`} />
        </div>
      )}

      <div className={styles.container}>
        <div className={gridClasses}>
          <div className={styles.content}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>

            {features.length > 0 && (
              <div className={styles.features}>
                {features.map((feature, index) => (
                  <div key={index} className={styles.feature}>
                    <div className={styles.featureIcon}>{feature.icon}</div>
                    <div className={styles.featureText}>{feature.text}</div>
                  </div>
                ))}
              </div>
            )}

            {ctaText && ctaHref && (
              <div className={styles.cta}>
                <Link href={ctaHref} className={styles.ctaButton}>
                  {ctaText}
                </Link>
              </div>
            )}
          </div>

          {imageUrl && (
            <div className={styles.media}>
              <Image
                src={imageUrl}
                alt={imageAlt || title}
                fill
                className={styles.image}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className={styles.halftoneOverlay} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

FeatureSection.displayName = 'FeatureSection';
