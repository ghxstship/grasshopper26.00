/**
 * AdminListTemplate - Admin list page layout template
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Box, Stack, Heading, Text, Input, Button, Spinner } from '../../atoms';
import styles from './AdminListTemplate.module.css';

export interface AdminListTemplateStat {
  label: string;
  value: string | number;
  icon?: ReactNode;
}

export interface AdminListTemplateTab {
  key: string;
  label: string;
}

export interface AdminListTemplateAction {
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface AdminListTemplateEmpty {
  icon: ReactNode;
  title: string;
  description: string;
  action?: AdminListTemplateAction;
}

export interface AdminListTemplateProps {
  /** Page content */
  children: ReactNode;
  /** Page title */
  title: string;
  /** Page subtitle */
  subtitle?: string;
  /** Page description */
  description?: string;
  /** Stats to display */
  stats?: AdminListTemplateStat[];
  /** Tabs for filtering */
  tabs?: AdminListTemplateTab[];
  /** Active tab key */
  activeTab?: string;
  /** Tab change handler */
  onTabChange?: (key: string) => void;
  /** Search value */
  searchValue?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Primary action */
  primaryAction?: AdminListTemplateAction;
  /** Secondary action */
  secondaryAction?: AdminListTemplateAction;
  /** Loading state */
  loading?: boolean;
  /** Empty state */
  empty?: AdminListTemplateEmpty;
  /** Sidebar */
  sidebar?: ReactNode;
}

export function AdminListTemplate({
  children,
  title,
  subtitle,
  description,
  stats,
  tabs,
  activeTab,
  onTabChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  primaryAction,
  secondaryAction,
  loading,
  empty,
  sidebar,
}: AdminListTemplateProps) {
  return (
    <div className={styles.container}>
      {sidebar && <aside className={styles.sidebar}>{sidebar}</aside>}
      
      <div className={styles.main}>
        {/* Page Header */}
        <div className={styles.header}>
          <Stack gap={2}>
            <Heading level={1} font="anton">
              {title}
            </Heading>
            {(subtitle || description) && (
              <Text size="lg" color="secondary">
                {subtitle || description}
              </Text>
            )}
          </Stack>
          
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

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className={styles.stats}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                {stat.icon && <div className={styles.statIcon}>{stat.icon}</div>}
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>{stat.label}</div>
                  <div className={styles.statValue}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

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

        {/* Search */}
        {onSearchChange && (
          <div className={styles.search}>
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <Spinner size="lg" />
              <Text color="secondary">Loading...</Text>
            </div>
          ) : empty ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>{empty.icon}</div>
              <Heading level={3}>{empty.title}</Heading>
              <Text color="secondary">{empty.description}</Text>
              {empty.action && (
                empty.action.href ? (
                  <Link href={empty.action.href}>
                    <Button variant="primary">
                      {empty.action.icon}
                      {empty.action.label}
                    </Button>
                  </Link>
                ) : (
                  <Button variant="primary" onClick={empty.action.onClick}>
                    {empty.action.icon}
                    {empty.action.label}
                  </Button>
                )
              )}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
