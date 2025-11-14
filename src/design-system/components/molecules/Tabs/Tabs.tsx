/**
 * Tabs - Tab navigation molecule
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { useState, ReactNode } from 'react';
import { Stack, Text } from '../../atoms';
import styles from './Tabs.module.css';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  /** Tabs array */
  tabs: Tab[];
  /** Default active tab */
  defaultTab?: string;
  /** Tab change handler */
  onTabChange?: (tabId: string) => void;
}

export function Tabs({ tabs, defaultTab, onTabChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <Stack gap={0}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => handleTabClick(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
          >
            <Text font="bebas" size="lg" uppercase>
              {tab.label}
            </Text>
          </button>
        ))}
      </div>

      <div
        className={styles.tabPanel}
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTabContent}
      </div>
    </Stack>
  );
}
