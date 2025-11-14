/**
 * Footer - Site footer organism
 * GHXSTSHIP Atomic Design System
 */

import Link from 'next/link';
import { Box, Stack, Grid, Heading, Text } from '../../atoms';
import styles from './Footer.module.css';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  /** Footer columns */
  columns?: FooterColumn[];
  /** Copyright text */
  copyright?: string;
  /** Social links */
  socialLinks?: FooterLink[];
}

export function Footer({
  columns = [],
  copyright = `© ${new Date().getFullYear()} GVTEWAY. All rights reserved.`,
  socialLinks = [],
}: FooterProps) {
  return (
    <Box as="footer" className={styles.footer} border borderWidth={3}>
      <Box className={styles.container}>
        <Grid columns={4} gap={8} responsive>
          {columns.map((column) => (
            <Stack key={column.title} gap={4}>
              <Heading level={4} font="bebas">
                {column.title}
              </Heading>
              <Stack gap={2}>
                {column.links.map((link) => (
                  <Link key={link.href} href={link.href} className={styles.link}>
                    <Text font="share" size="sm">
                      {link.label}
                    </Text>
                  </Link>
                ))}
              </Stack>
            </Stack>
          ))}
        </Grid>

        <Box className={styles.bottom}>
          <Stack direction="horizontal" justify="between" align="center" gap={4} wrap>
            <Text font="share-mono" size="sm" color="tertiary">
              {copyright}
            </Text>

            {socialLinks.length > 0 && (
              <Stack direction="horizontal" gap={4}>
                {socialLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={styles.socialLink}>
                    <Text font="bebas" size="lg">
                      {link.label}
                    </Text>
                  </Link>
                ))}
              </Stack>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
