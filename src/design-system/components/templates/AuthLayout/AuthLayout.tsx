/**
 * Auth Layout Template
 * GHXSTSHIP Monochromatic Design System
 * Centered authentication forms with geometric branding
 */

import * as React from "react";
import styles from './AuthLayout.module.css';

export interface AuthLayoutProps {
  /** Logo component */
  logo?: React.ReactNode;
  
  /** Form content */
  children: React.ReactNode;
  
  /** Footer links */
  footer?: React.ReactNode;
  
  /** Background pattern variant */
  pattern?: 'halftone' | 'stripes' | 'grid' | 'none';
  
  /** Invert colors */
  inverted?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  logo,
  children,
  footer,
  pattern = 'halftone',
  inverted = false,
}) => {
  return (
    <div 
      className={`${styles.layout} ${inverted ? styles.inverted : ''}`}
      data-pattern={pattern}
    >
      {/* Background Pattern */}
      <div className={styles.pattern} aria-hidden="true" />
      
      {/* Auth Container */}
      <div className={styles.container}>
        {/* Logo */}
        {logo && (
          <div className={styles.logo}>
            {logo}
          </div>
        )}
        
        {/* Form Card */}
        <div className={styles.card}>
          {children}
        </div>
        
        {/* Footer Links */}
        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
