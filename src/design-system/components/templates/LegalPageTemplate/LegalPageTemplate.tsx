/**
 * LegalPageTemplate - Template for legal pages (Terms, Privacy, etc.)
 * GHXSTSHIP Atomic Design System
 */

import { ReactNode } from 'react';
import { Stack, Heading, Text, Container } from '@/design-system/components/atoms';
import styles from './LegalPageTemplate.module.css';

export interface LegalPageTemplateProps {
  /** Page title */
  title: string;
  /** Last updated date */
  lastUpdated?: string;
  /** Page content */
  children: ReactNode;
}

export function LegalPageTemplate({ title, lastUpdated, children }: LegalPageTemplateProps) {
  return (
    <div className={styles.template}>
      <Container maxWidth="md">
        <Stack gap={8}>
          <Stack gap={2}>
            <Heading level={1} font="anton" align="center">
              {title}
            </Heading>
            {lastUpdated && (
              <Text size="sm" color="secondary" align="center">
                Last Updated: {lastUpdated}
              </Text>
            )}
          </Stack>

          <div className={styles.content}>{children}</div>
        </Stack>
      </Container>
    </div>
  );
}
