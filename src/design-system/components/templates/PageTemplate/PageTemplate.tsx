/**
 * PageTemplate - Base page layout template
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { ReactNode } from 'react';
import { Box, Stack } from '../../atoms';
import { Header, HeaderProps } from '../../molecules';
import { Footer, FooterProps } from '../../organisms';
import styles from './PageTemplate.module.css';

export interface PageTemplateProps {
  /** Page content */
  children: ReactNode;
  /** Header props */
  headerProps?: HeaderProps;
  /** Footer props */
  footerProps?: FooterProps;
  /** Show header */
  showHeader?: boolean;
  /** Show footer */
  showFooter?: boolean;
  /** Max width container */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function PageTemplate({
  children,
  headerProps,
  footerProps,
  showHeader = true,
  showFooter = true,
  maxWidth = 'xl',
}: PageTemplateProps) {
  return (
    <div className={styles.page}>
      {showHeader && <Header {...headerProps} />}

      <Box as="main" className={styles.main}>
        <div className={`${styles.container} ${styles[`maxWidth-${maxWidth}`]}`}>
          {children}
        </div>
      </Box>

      {showFooter && <Footer {...footerProps} />}
    </div>
  );
}
