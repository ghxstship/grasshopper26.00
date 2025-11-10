/**
 * Accordion Component
 * GHXSTSHIP Entertainment Platform - Collapsible content sections
 * Geometric accordion with hard edges for FAQ/info sections
 */

'use client';

import * as React from 'react';
import styles from './Accordion.module.css';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
  className = '',
}) => {
  const [openIds, setOpenIds] = React.useState<Set<string>>(
    new Set(defaultOpenIds)
  );

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  const containerClassNames = [
    styles.accordion,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClassNames}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        
        return (
          <div key={item.id} className={styles.item}>
            <button
              className={styles.trigger}
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
            >
              <span className={styles.title}>{item.title}</span>
              <span className={styles.icon} aria-hidden="true">
                {isOpen ? '−' : '+'}
              </span>
            </button>
            
            {isOpen && (
              <div
                id={`accordion-content-${item.id}`}
                className={styles.content}
                role="region"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
