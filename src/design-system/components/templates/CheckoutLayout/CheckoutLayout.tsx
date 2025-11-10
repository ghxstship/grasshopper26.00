/**
 * Checkout Layout Template
 * GHXSTSHIP Monochromatic Design System
 * Two-column checkout with form and order summary
 */

import * as React from "react";
import styles from './CheckoutLayout.module.css';

export interface CheckoutLayoutProps {
  /** Logo/branding */
  logo?: React.ReactNode;
  
  /** Progress indicator */
  progress?: React.ReactNode;
  
  /** Steps configuration */
  steps?: Array<{
    key: string;
    label: string;
    completed?: boolean;
  }>;
  
  /** Step content */
  stepContent?: React.ReactNode;
  
  /** Checkout form content */
  form?: React.ReactNode;
  
  /** Order summary sidebar */
  summary?: React.ReactNode;
  
  /** Order summary component */
  orderSummary?: React.ReactNode;
  
  /** Next button handler */
  onNext?: () => void;
  
  /** Back button handler */
  onBack?: () => void;
  
  /** Next button loading state */
  nextLoading?: boolean;
  
  /** Footer */
  footer?: React.ReactNode;
  
  /** Current step */
  currentStep?: number;
  
  /** Total steps */
  totalSteps?: number;
}

export const CheckoutLayout: React.FC<CheckoutLayoutProps> = ({
  logo,
  progress,
  form,
  summary,
  footer,
  currentStep,
  totalSteps,
}) => {
  return (
    <div className={styles.layout}>
      {/* Header */}
      <header className={styles.header} role="banner">
        <div className={styles.headerContent}>
          {logo && (
            <div className={styles.logo}>
              {logo}
            </div>
          )}
          
          {progress && (
            <div className={styles.progress}>
              {progress}
            </div>
          )}
          
          {currentStep && totalSteps && (
            <div className={styles.stepIndicator} aria-label={`Step ${currentStep} of ${totalSteps}`}>
              <span className={styles.stepCurrent}>{currentStep}</span>
              <span className={styles.stepSeparator}>/</span>
              <span className={styles.stepTotal}>{totalSteps}</span>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Container */}
      <div className={styles.container}>
        {/* Form Section */}
        <div className={styles.formSection}>
          <div className={styles.formContent}>
            {form}
          </div>
        </div>
        
        {/* Summary Section */}
        <aside className={styles.summarySection} aria-label="Order summary">
          <div className={styles.summaryContent}>
            {summary}
          </div>
        </aside>
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
