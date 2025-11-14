/**
 * ContextualPageTemplate - Contextual page layout with breadcrumbs and metadata
 * GHXSTSHIP Design System
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Box, Stack, Heading, Text, Button, Spinner } from '../../atoms';
import styles from './ContextualPageTemplate.module.css';

export interface ContextualPageTemplateBreadcrumb {
  label: string;
  href: string;
}

export interface ContextualPageTemplateAction {
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface ContextualPageTemplateProps {
  /** Page content */
  children: ReactNode;
  /** Breadcrumbs */
  breadcrumbs?: ContextualPageTemplateBreadcrumb[];
  /** Page title */
  title: string;
  /** Page subtitle */
  subtitle?: string;
  /** Status badge */
  statusBadge?: ReactNode;
  /** Metadata */
  metadata?: ReactNode;
  /** Primary action */
  primaryAction?: ContextualPageTemplateAction;
  /** Secondary action */
  secondaryAction?: ContextualPageTemplateAction;
  /** Loading state */
  loading?: boolean;
  /** Tabs */
  tabs?: Array<{ key: string; label: string; content: ReactNode }>;
  /** Sidebar */
  sidebar?: ReactNode;
}

export function ContextualPageTemplate({
  children,
  breadcrumbs,
  title,
  subtitle,
  statusBadge,
  metadata,
  primaryAction,
  secondaryAction,
  loading,
  tabs,
  sidebar,
}: ContextualPageTemplateProps) {
  return (
    <div className={styles.container}>
      {sidebar && <aside className={styles.sidebar}>{sidebar}</aside>}
      
      <div className={styles.main}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className={styles.breadcrumbs}>
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className={styles.breadcrumbItem}>
                {index > 0 && <span className={styles.breadcrumbSeparator}>/</span>}
                <Link href={crumb.href} className={styles.breadcrumbLink}>
                  {crumb.label}
                </Link>
              </span>
            ))}
          </nav>
        )}

        {/* Page Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Stack gap={2}>
              <div className={styles.titleRow}>
                <Heading level={1} font="anton">
                  {title}
                </Heading>
                {statusBadge && <div className={styles.statusBadge}>{statusBadge}</div>}
              </div>
              {subtitle && (
                <Text size="lg" color="secondary">
                  {subtitle}
                </Text>
              )}
              {metadata && <div className={styles.metadata}>{metadata}</div>}
            </Stack>
          </div>
          
          <div className={styles.actions}>
            {secondaryAction && (
              secondaryAction.href ? (
                <Link href={secondaryAction.href}>
                  <Button variant="secondary">
                    {secondaryAction.icon}
                    {secondaryAction.label}
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" onClick={secondaryAction.onClick}>
                  {secondaryAction.icon}
                  {secondaryAction.label}
                </Button>
              )
            )}
            {primaryAction && (
              primaryAction.href ? (
                <Link href={primaryAction.href}>
                  <Button variant="primary">
                    {primaryAction.icon}
                    {primaryAction.label}
                  </Button>
                </Link>
              ) : (
                <Button variant="primary" onClick={primaryAction.onClick}>
                  {primaryAction.icon}
                  {primaryAction.label}
                </Button>
              )
            )}
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <Spinner size="lg" />
              <Text color="secondary">Loading...</Text>
            </div>
          ) : tabs ? (
            <div className={styles.tabs}>
              {/* Tabs implementation would go here */}
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
