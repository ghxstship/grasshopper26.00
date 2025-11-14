/**
 * AdminDetailTemplate - Admin detail page layout template
 * GHXSTSHIP Design System
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Box, Stack, Heading, Text, Button, Spinner } from '../../atoms';
import styles from './AdminDetailTemplate.module.css';

export interface AdminDetailTemplateBreadcrumb {
  label: string;
  href: string;
}

export interface AdminDetailTemplateTab {
  key: string;
  label: string;
  content: ReactNode;
}

export interface AdminDetailTemplateAction {
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface AdminDetailTemplateProps {
  /** Page content */
  children: ReactNode;
  /** Breadcrumbs */
  breadcrumbs?: AdminDetailTemplateBreadcrumb[];
  /** Page title */
  title: string;
  /** Page subtitle */
  subtitle?: string;
  /** Status badge */
  statusBadge?: ReactNode;
  /** Metadata */
  metadata?: ReactNode;
  /** Primary action */
  primaryAction?: AdminDetailTemplateAction;
  /** Secondary actions */
  secondaryActions?: AdminDetailTemplateAction[];
  /** Loading state */
  loading?: boolean;
  /** Tabs */
  tabs?: AdminDetailTemplateTab[];
  /** Active tab */
  activeTab?: string;
  /** Tab change handler */
  onTabChange?: (key: string) => void;
}

export function AdminDetailTemplate({
  children,
  breadcrumbs,
  title,
  subtitle,
  statusBadge,
  metadata,
  primaryAction,
  secondaryActions,
  loading,
  tabs,
  activeTab,
  onTabChange,
}: AdminDetailTemplateProps) {
  return (
    <div className={styles.container}>
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
          {secondaryActions && secondaryActions.map((action, index) => (
            action.href ? (
              <Link key={index} href={action.href}>
                <Button variant={action.variant || 'secondary'}>
                  {action.icon}
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button key={index} variant={action.variant || 'secondary'} onClick={action.onClick}>
                {action.icon}
                {action.label}
              </Button>
            )
          ))}
          {primaryAction && (
            primaryAction.href ? (
              <Link href={primaryAction.href}>
                <Button variant={primaryAction.variant || 'primary'}>
                  {primaryAction.icon}
                  {primaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button variant={primaryAction.variant || 'primary'} onClick={primaryAction.onClick}>
                {primaryAction.icon}
                {primaryAction.label}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
              onClick={() => onTabChange?.(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <Spinner size="lg" />
            <Text color="secondary">Loading...</Text>
          </div>
        ) : tabs && activeTab ? (
          tabs.find(t => t.key === activeTab)?.content || children
        ) : (
          children
        )}
      </div>
    </div>
  );
}
