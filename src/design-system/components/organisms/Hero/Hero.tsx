/**
 * Hero - Hero section organism
 * GHXSTSHIP Atomic Design System
 */

import Link from 'next/link';
import { Box, Stack, Heading, Text, Button } from '../../atoms';
import styles from './Hero.module.css';

export interface HeroProps {
  /** Hero title */
  title: string;
  /** Hero subtitle */
  subtitle?: string;
  /** CTA button text */
  ctaText?: string;
  /** CTA button link */
  ctaHref?: string;
  /** Secondary CTA text */
  secondaryCtaText?: string;
  /** Secondary CTA link */
  secondaryCtaHref?: string;
  /** Background image */
  backgroundImage?: string;
}

export function Hero({
  title,
  subtitle,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
  backgroundImage,
}: HeroProps) {
  return (
    <Box
      as="section"
      className={styles.hero}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      <div className={styles.overlay} />
      <div className={styles.content}>
        <Stack gap={6} align="center">
          <Heading level={1} font="anton" align="center">
            {title}
          </Heading>

          {subtitle && (
            <Text font="bebas" size="2xl" align="center" color="secondary">
              {subtitle}
            </Text>
          )}

          {(ctaText || secondaryCtaText) && (
            <Stack direction="horizontal" gap={4} className={styles.ctas}>
              {ctaText && ctaHref && (
                <Link href={ctaHref} className={styles.ctaLink}>
                  <Button variant="primary" size="xl">
                    {ctaText}
                  </Button>
                </Link>
              )}
              {secondaryCtaText && secondaryCtaHref && (
                <Link href={secondaryCtaHref} className={styles.ctaLink}>
                  <Button variant="secondary" size="xl">
                    {secondaryCtaText}
                  </Button>
                </Link>
              )}
            </Stack>
          )}
        </Stack>
      </div>
    </Box>
  );
}
