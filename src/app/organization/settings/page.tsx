'use client';

import { Heading, Text, Stack, Card } from '@/design-system';
import { AdminTemplate } from '@/design-system';
import { Settings } from 'lucide-react';
import styles from './settings.module.css';

export default function AdminSettingsPage() {
  return (
    <AdminTemplate
      title="Admin Settings"
      description="Configure platform settings and preferences"
    >
      <Card variant="outlined" padding={6}>
        <Stack gap={4}>
          <Heading level={2} font="bebas">
            Platform Settings
          </Heading>
          <Text className={styles.description}>
            Settings configuration coming soon.
          </Text>
        </Stack>
      </Card>
    </AdminTemplate>
  );
}
