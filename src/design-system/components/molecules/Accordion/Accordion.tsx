/**
 * Accordion Component
 * GHXSTSHIP Entertainment Platform - Accordion Item
 * Single accordion item with geometric expand icon
 */

import * as React from 'react';
import styles from './Accordion.module.css';

export interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ title, children, defaultOpen = false, icon, className = '' }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    const contentRef = React.useRef<HTMLDivElement>(null);

    const classNames = [
      styles.accordion,
      isOpen && styles.open,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames}>
        <button
          className={styles.header}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          {icon && <span className={styles.icon}>{icon}</span>}
          <span className={styles.title}>{title}</span>
          <span className={styles.indicator} aria-hidden="true">
            {isOpen ? '−' : '+'}
          </span>
        </button>

        <div
          ref={contentRef}
          className={styles.content}
          style={{
            maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : '0',
          }}
        >
          <div className={styles.contentInner}>{children}</div>
        </div>
      </div>
    );
  }
);

Accordion.displayName = 'Accordion';
