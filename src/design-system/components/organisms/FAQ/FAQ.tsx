/**
 * FAQ Component
 * GHXSTSHIP Entertainment Platform - FAQ Accordion
 * Geometric expand icons with hard-edge animations
 */

'use client';

import * as React from 'react';
import styles from './FAQ.module.css';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQProps {
  items: FAQItem[];
  title?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const FAQ = React.forwardRef<HTMLDivElement, FAQProps>(
  ({ items, title = 'FREQUENTLY ASKED QUESTIONS', allowMultiple = false, className = '' }, ref) => {
    const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

    const toggleItem = (id: string) => {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (!allowMultiple) {
            next.clear();
          }
          next.add(id);
        }
        return next;
      });
    };

    const classNames = [
      styles.container,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames}>
        <h2 className={styles.title}>{title}</h2>

        <div className={styles.items}>
          {items.map((item) => {
            const isExpanded = expandedIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`${styles.item} ${isExpanded ? styles.expanded : ''}`}
              >
                <button
                  className={styles.question}
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`faq-answer-${item.id}`}
                >
                  <span className={styles.questionText}>{item.question}</span>
                  <span className={styles.icon} aria-hidden="true">
                    {isExpanded ? '−' : '+'}
                  </span>
                </button>

                <div
                  id={`faq-answer-${item.id}`}
                  className={styles.answer}
                  aria-hidden={!isExpanded}
                >
                  <div className={styles.answerContent}>
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

FAQ.displayName = 'FAQ';
