/**
 * PricingCard - Pricing tier card molecule
 * GHXSTSHIP Atomic Design System
 */

import { Card, Stack, Heading, Text, Button } from '../../atoms';
import styles from './PricingCard.module.css';

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingCardProps {
  /** Tier name */
  name: string;
  /** Price */
  price: string;
  /** Price period */
  period?: string;
  /** Description */
  description?: string;
  /** Features list */
  features: PricingFeature[];
  /** CTA text */
  ctaText?: string;
  /** CTA handler */
  onCta?: () => void;
  /** Highlighted/featured */
  featured?: boolean;
}

export function PricingCard({
  name,
  price,
  period = '/month',
  description,
  features,
  ctaText = 'Get Started',
  onCta,
  featured,
}: PricingCardProps) {
  return (
    <Card
      variant="elevated"
      padding={8}
      className={featured ? styles.featured : undefined}
    >
      <Stack gap={6}>
        <Stack gap={2}>
          <Heading level={3} font="bebas">
            {name}
          </Heading>
          {description && (
            <Text size="sm" color="secondary">
              {description}
            </Text>
          )}
        </Stack>

        <div className={styles.price}>
          <Text font="anton" size="5xl">
            {price}
          </Text>
          <Text size="lg" color="secondary">
            {period}
          </Text>
        </div>

        <Stack gap={3}>
          {features.map((feature, index) => (
            <div key={index} className={styles.feature}>
              <span className={styles.checkmark}>
                {feature.included ? '✓' : '✕'}
              </span>
              <Text size="sm" color={feature.included ? 'primary' : 'tertiary'}>
                {feature.text}
              </Text>
            </div>
          ))}
        </Stack>

        <Button
          variant={featured ? 'primary' : 'secondary'}
          size="lg"
          fullWidth
          onClick={onCta}
        >
          {ctaText}
        </Button>
      </Stack>
    </Card>
  );
}
