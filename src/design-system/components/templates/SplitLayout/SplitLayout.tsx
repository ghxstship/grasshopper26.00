/**
 * Split Layout Template
 * GHXSTSHIP Monochromatic Design System
 * Two-column layout with image and content
 */

import * as React from "react";
import styles from './SplitLayout.module.css';

export interface SplitLayoutProps {
  /** Header/navigation */
  header?: React.ReactNode;
  
  /** Left content */
  left: React.ReactNode;
  
  /** Right content */
  right: React.ReactNode;
  
  /** Reverse order (image on right) */
  reverse?: boolean;
  
  /** Split ratio */
  ratio?: '50-50' | '60-40' | '40-60';
  
  /** Footer */
  footer?: React.ReactNode;
  
  /** Sticky side */
  stickySide?: 'left' | 'right' | 'none';
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({
  header,
  left,
  right,
  reverse = false,
  ratio = '50-50',
  footer,
  stickySide = 'none',
}) => {
  return (
    <div className={styles.layout}>
      {/* Header */}
      {header && (
        <div className={styles.header}>
          {header}
        </div>
      )}
      
      {/* Split Container */}
      <div 
        className={`${styles.container} ${reverse ? styles.reverse : ''}`}
        data-ratio={ratio}
      >
        {/* Left Side */}
        <div 
          className={`${styles.side} ${styles.left} ${stickySide === 'left' ? styles.sticky : ''}`}
        >
          {left}
        </div>
        
        {/* Right Side */}
        <div 
          className={`${styles.side} ${styles.right} ${stickySide === 'right' ? styles.sticky : ''}`}
        >
          {right}
        </div>
      </div>
      
      {/* Footer */}
      {footer && (
        <footer className={styles.footer} role="contentinfo">
          {footer}
        </footer>
      )}
    </div>
  );
};
