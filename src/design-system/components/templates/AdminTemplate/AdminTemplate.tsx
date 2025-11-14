/**
 * AdminTemplate - Admin page layout template
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Box, Stack, Heading, Text } from '../../atoms';
import { Header } from '../../molecules';
import styles from './AdminTemplate.module.css';

export interface AdminTemplateProps {
  /** Page content */
  children: ReactNode;
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Actions */
  actions?: ReactNode;
}

const adminNavItems = [
  { label: 'Dashboard', href: '/organization/dashboard' },
  { label: 'Events', href: '/organization/events' },
  { label: 'Orders', href: '/organization/orders' },
  { label: 'Users', href: '/organization/users' },
  { label: 'Products', href: '/organization/products' },
];

export function AdminTemplate({
  children,
  title,
  description,
  actions,
}: AdminTemplateProps) {
  return (
    <div className={styles.admin}>
      <Header
        logoText="GVTEWAY ADMIN"
        navItems={adminNavItems}
        showAuth={true}
      />

      <Box as="main" className={styles.main}>
        <div className={styles.container}>
          <Stack gap={8}>
            {/* Page Header */}
            <Stack direction="horizontal" justify="between" align="center" wrap>
              <Stack gap={2}>
                <Heading level={1} font="anton">
                  {title}
                </Heading>
                {description && (
                  <Text size="lg" color="secondary">
                    {description}
                  </Text>
                )}
              </Stack>
              {actions && <div className={styles.actions}>{actions}</div>}
            </Stack>

            {/* Page Content */}
            {children}
          </Stack>
        </div>
      </Box>
    </div>
  );
}
