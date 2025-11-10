/**
 * Error Layout Template
 * GHXSTSHIP Monochromatic Design System
 * 404, 500, and error pages with geometric styling
 */

import * as React from "react";
import styles from './ErrorLayout.module.css';

export interface ErrorLayoutProps {
  /** Error code (404, 500, etc.) */
  code?: string | number;
  
  /** Error title */
  title: string;
  
  /** Error message */
  message?: string;
  
  /** Action buttons */
  actions?: React.ReactNode;
  
  /** Logo */
  logo?: React.ReactNode;
  
  /** Show geometric pattern */
  showPattern?: boolean;
}

export const ErrorLayout: React.FC<ErrorLayoutProps> = ({
  code,
  title,
  message,
  actions,
  logo,
  showPattern = true,
}) => {
  return (
    <div className={styles.layout}>
      {/* Background Pattern */}
      {showPattern && (
        <div className={styles.pattern} aria-hidden="true" />
      )}
      
      {/* Content */}
      <div className={styles.content}>
        {/* Logo */}
        {logo && (
          <div className={styles.logo}>
            {logo}
          </div>
        )}
        
        {/* Error Code */}
        {code && (
          <div className={styles.code} aria-label={`Error ${code}`}>
            {code}
          </div>
        )}
        
        {/* Title */}
        <h1 className={styles.title}>{title}</h1>
        
        {/* Message */}
        {message && (
          <p className={styles.message}>{message}</p>
        )}
        
        {/* Actions */}
        {actions && (
          <div className={styles.actions}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
