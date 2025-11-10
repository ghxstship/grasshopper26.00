/**
 * Admin Form Template
 * GHXSTSHIP Monochromatic Design System
 * Template for admin create/edit forms with validation and actions
 */

import * as React from "react";
import styles from './AdminFormTemplate.module.css';

export interface AdminFormTemplateProps {
  /** Sidebar navigation */
  sidebar?: React.ReactNode;
  
  /** Page title */
  title: string;
  
  /** Page description */
  description?: string;
  
  /** Breadcrumbs */
  breadcrumbs?: any;
  
  /** Status badge */
  statusBadge?: {
    label: string;
    variant: string;
  };
  
  /** Loading state */
  loading?: boolean;
  
  /** Tabs */
  tabs?: Array<{
    key: string;
    label: string;
    content?: React.ReactNode;
  }>;
  
  /** Metadata items */
  metadata?: Array<{
    label: string;
    value: any;
    icon?: React.ReactNode;
  }>;
  
  /** Form content */
  children?: React.ReactNode;
  
  /** Primary action button (usually Save/Submit) */
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
  
  /** Secondary action button (usually Cancel) */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  
  /** Additional actions in header */
  actions?: React.ReactNode;
  
  /** Validation errors */
  errors?: Record<string, string>;
  
  /** Success message */
  successMessage?: string;
  
  /** Error message */
  errorMessage?: string;
  
  /** Form mode */
  mode?: 'create' | 'edit';
  
  /** Show draft/publish toggle */
  showDraftToggle?: boolean;
  
  /** Draft state */
  isDraft?: boolean;
  
  /** On draft toggle */
  onDraftToggle?: (isDraft: boolean) => void;
}

export const AdminFormTemplate: React.FC<AdminFormTemplateProps> = ({
  sidebar,
  title,
  description,
  breadcrumbs,
  children,
  primaryAction,
  secondaryAction,
  actions,
  loading = false,
  errors,
  successMessage,
  errorMessage,
  mode = 'create',
  showDraftToggle = false,
  isDraft = false,
  onDraftToggle,
}) => {
  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar} aria-label="Admin navigation">
        {sidebar}
      </aside>
      
      {/* Main Content Area */}
      <div className={styles.content}>
        {/* Sticky Header */}
        <div className={styles.stickyHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              {breadcrumbs && (
                <div className={styles.breadcrumbs}>
                  {breadcrumbs}
                </div>
              )}
              <div>
                <h1 className={styles.title}>{title}</h1>
                {description && (
                  <p className={styles.description}>{description}</p>
                )}
              </div>
            </div>
            
            <div className={styles.headerActions}>
              {showDraftToggle && (
                <div className={styles.draftToggle}>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={!isDraft}
                      onChange={(e) => onDraftToggle?.(!e.target.checked)}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleText}>
                      {isDraft ? 'Draft' : 'Published'}
                    </span>
                  </label>
                </div>
              )}
              
              {actions}
              
              {secondaryAction && (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  className={styles.secondaryButton}
                >
                  {secondaryAction.label}
                </button>
              )}
              
              {primaryAction && (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled || primaryAction.loading}
                  className={styles.primaryButton}
                >
                  {primaryAction.loading ? 'Saving...' : primaryAction.label}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Messages */}
        {successMessage && (
          <div className={styles.successMessage} role="alert">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className={styles.errorMessage} role="alert">
            {errorMessage}
          </div>
        )}
        
        {/* Form Content */}
        <div className={styles.formContent}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading...</p>
            </div>
          ) : (
            children
          )}
        </div>
        
        {/* Validation Errors Summary */}
        {errors && Object.keys(errors).length > 0 && (
          <div className={styles.errorsSummary} role="alert">
            <h3 className={styles.errorsSummaryTitle}>Please fix the following errors:</h3>
            <ul className={styles.errorsList}>
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className={styles.errorItem}>
                  <strong>{field}:</strong> {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
