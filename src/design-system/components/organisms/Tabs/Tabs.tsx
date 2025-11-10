'use client';

import React, { useState } from 'react';
import styles from './Tabs.module.css';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /** Tab items */
  tabs: Tab[];
  /** Default active tab ID */
  defaultActiveId?: string;
  /** Active tab change handler */
  onTabChange?: (tabId: string) => void;
  /** Additional CSS class */
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActiveId,
  onTabChange,
  className = '',
}) => {
  const [activeTabId, setActiveTabId] = useState(defaultActiveId || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.disabled) return;

    setActiveTabId(tabId);
    onTabChange?.(tabId);
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div className={`${styles.tabs} ${className}`}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${tab.id === activeTabId ? styles.active : ''}`}
            onClick={() => handleTabClick(tab.id)}
            disabled={tab.disabled}
            role="tab"
            aria-selected={tab.id === activeTabId}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={styles.tabPanel}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== activeTabId}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};

Tabs.displayName = 'Tabs';
