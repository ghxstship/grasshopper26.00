/**
 * CheckoutLayout Template
 * GHXSTSHIP Design System
 * Layout for checkout flow with form and summary
 */

import React from 'react';
import styles from './CheckoutLayout.module.css';

export interface CheckoutLayoutProps {
  logo?: React.ReactNode;
  currentStep?: number;
  totalSteps?: number;
  form: React.ReactNode;
  summary: React.ReactNode;
}

export function CheckoutLayout({
  logo,
  currentStep,
  totalSteps,
  form,
  summary,
}: CheckoutLayoutProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {logo && <div className={styles.logo}>{logo}</div>}
          {currentStep !== undefined && totalSteps !== undefined && (
            <div className={styles.progress}>
              <span className={styles.progressText}>
                Step {currentStep} of {totalSteps}
              </span>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>
      <div className={styles.main}>
        <div className={styles.formColumn}>{form}</div>
        <aside className={styles.summaryColumn}>{summary}</aside>
      </div>
    </div>
  );
}
