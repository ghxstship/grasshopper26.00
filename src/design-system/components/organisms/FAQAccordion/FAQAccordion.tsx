'use client';

import React, { useState } from 'react';
import styles from './FAQAccordion.module.css';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface FAQAccordionProps {
  /** FAQ items */
  items: FAQItem[];
  /** Allow multiple items open at once */
  allowMultiple?: boolean;
  /** Initially open item IDs */
  defaultOpenIds?: string[];
  /** Additional CSS class */
  className?: string;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
  className = '',
}) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`${styles.accordion} ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const itemClasses = [styles.item, isOpen && styles.open]
          .filter(Boolean)
          .join(' ');

        return (
          <div key={item.id} className={itemClasses}>
            <button
              className={styles.header}
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-content-${item.id}`}
            >
              <h3 className={styles.question}>{item.question}</h3>
              <div className={styles.icon}>+</div>
            </button>

            <div
              id={`faq-content-${item.id}`}
              className={styles.content}
              role="region"
              aria-labelledby={`faq-header-${item.id}`}
            >
              <div className={styles.answer}>
                {item.category && <div className={styles.category}>{item.category}</div>}
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

FAQAccordion.displayName = 'FAQAccordion';
