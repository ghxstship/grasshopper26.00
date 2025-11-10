/**
 * Legal Page Template
 * Standardized layout for legal and informational pages
 * Used for: Privacy Policy, Terms of Service, Cookie Policy, About pages
 */

'use client';

import { Card, CardContent } from '@/design-system/components/atoms/card';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './LegalPageTemplate.module.css';

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

export interface LegalPageTemplateProps {
  // Header
  title: string;
  lastUpdated?: string;
  
  // Content
  children: React.ReactNode;
  
  // Table of Contents
  showTableOfContents?: boolean;
  tableOfContents?: TableOfContentsItem[];
  
  // Navigation
  backHref?: string;
  backLabel?: string;
}

export function LegalPageTemplate({
  title,
  lastUpdated,
  children,
  showTableOfContents = true,
  tableOfContents,
  backHref = '/',
  backLabel = 'Back to Home',
}: LegalPageTemplateProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const [generatedToc, setGeneratedToc] = useState<TableOfContentsItem[]>([]);

  // Auto-generate table of contents from headings if not provided
  useEffect(() => {
    if (!showTableOfContents || tableOfContents) return;

    const headings = document.querySelectorAll('.legal-content h2, .legal-content h3');
    const items: TableOfContentsItem[] = [];

    headings.forEach((heading) => {
      const id = heading.id || heading.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
      if (!heading.id) {
        heading.id = id;
      }

      items.push({
        id,
        title: heading.textContent || '',
        level: heading.tagName === 'H2' ? 2 : 3,
      });
    });

    setGeneratedToc(items);
  }, [showTableOfContents, tableOfContents]);

  // Track active section on scroll
  useEffect(() => {
    if (!showTableOfContents) return;

    const handleScroll = () => {
      const headings = document.querySelectorAll('.legal-content h2, .legal-content h3');
      let currentSection = '';

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          currentSection = heading.id;
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showTableOfContents]);

  const tocItems = tableOfContents || generatedToc;

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <Link href={backHref} className={styles.backButton}>
        <ChevronLeft className={styles.backIcon} />
        {backLabel}
      </Link>

      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {lastUpdated && (
          <p className={styles.lastUpdated}>
            Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </header>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Table of Contents */}
        {showTableOfContents && tocItems.length > 0 && (
          <aside className={styles.sidebar}>
            <Card className={styles.tocCard}>
              <CardContent className={styles.tocContent}>
                <h2 className={styles.tocTitle}>Table of Contents</h2>
                <nav className={styles.tocNav}>
                  <ul className={styles.tocList}>
                    {tocItems.map((item) => (
                      <li
                        key={item.id}
                        className={styles.tocItem}
                        data-level={item.level}
                      >
                        <a
                          href={`#${item.id}`}
                          className={
                            activeSection === item.id
                              ? styles.tocLinkActive
                              : styles.tocLink
                          }
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </CardContent>
            </Card>
          </aside>
        )}

        {/* Content */}
        <article className={`${styles.content} legal-content`}>
          {children}
        </article>
      </div>
    </div>
  );
}
