/**
 * SplitLayout Template
 * GHXSTSHIP Design System
 * Two-column layout with sticky sidebar (e.g., cart/checkout)
 */

import React from 'react';
import styles from './SplitLayout.module.css';

export interface SplitLayoutProps {
  header?: React.ReactNode;
  left: React.ReactNode;
  right: React.ReactNode;
  footer?: React.ReactNode;
  ratio?: '50-50' | '60-40' | '70-30';
  stickySide?: 'left' | 'right' | 'none';
}

export function SplitLayout({
  header,
  left,
  right,
  footer,
  ratio = '60-40',
  stickySide = 'none',
}: SplitLayoutProps) {
  const ratioClass = ratio === '50-50' ? styles.ratio5050 : ratio === '70-30' ? styles.ratio7030 : styles.ratio6040;
  const stickyClass = stickySide === 'left' ? styles.stickyLeft : stickySide === 'right' ? styles.stickyRight : '';

  return (
    <div className={styles.container}>
      {header && <header className={styles.header}>{header}</header>}
      <div className={`${styles.split} ${ratioClass} ${stickyClass}`}>
        <div className={styles.leftColumn}>{left}</div>
        <div className={styles.rightColumn}>{right}</div>
      </div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  );
}
