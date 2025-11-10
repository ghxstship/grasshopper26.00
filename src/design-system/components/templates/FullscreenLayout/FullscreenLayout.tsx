/**
 * Fullscreen Layout Template
 * GHXSTSHIP Monochromatic Design System
 * Immersive fullscreen experience (scanner, onboarding, etc.)
 */

import * as React from "react";
import styles from './FullscreenLayout.module.css';

export interface FullscreenLayoutProps {
  /** Main content */
  children: React.ReactNode;
  
  /** Top bar (minimal) */
  topBar?: React.ReactNode;
  
  /** Bottom bar (actions) */
  bottomBar?: React.ReactNode;
  
  /** Background color variant */
  variant?: 'primary' | 'inverse' | 'secondary';
  
  /** Center content vertically */
  centered?: boolean;
}

export const FullscreenLayout: React.FC<FullscreenLayoutProps> = ({
  children,
  topBar,
  bottomBar,
  variant = 'primary',
  centered = false,
}) => {
  return (
    <div 
      className={`${styles.layout} ${centered ? styles.centered : ''}`}
      data-variant={variant}
    >
      {/* Top Bar */}
      {topBar && (
        <div className={styles.topBar}>
          {topBar}
        </div>
      )}
      
      {/* Main Content */}
      <main className={styles.main} role="main">
        {children}
      </main>
      
      {/* Bottom Bar */}
      {bottomBar && (
        <div className={styles.bottomBar}>
          {bottomBar}
        </div>
      )}
    </div>
  );
};
