/**
 * TabNavigation Component
 * GHXSTSHIP Entertainment Platform - Tab Navigation
 * BEBAS NEUE tabs with thick underline indicator
 */

import * as React from 'react';
import styles from './TabNavigation.module.css';

export interface Tab {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'underline' | 'pills';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TabNavigation = React.forwardRef<HTMLDivElement, TabNavigationProps>(
  ({ tabs, activeTab, onTabChange, variant = 'underline', size = 'md', className = '' }, ref) => {
    const containerClassNames = [
      styles.container,
      styles[variant],
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={containerClassNames} role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          
          const tabClassNames = [
            styles.tab,
            isActive && styles.active,
            tab.disabled && styles.disabled,
          ].filter(Boolean).join(' ');

          return (
            <button
              key={tab.id}
              className={tabClassNames}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              disabled={tab.disabled}
            >
              <span className={styles.label}>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={styles.count}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
);

TabNavigation.displayName = 'TabNavigation';
