/**
 * News Detail Client
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { Stack, Heading, Text, Container } from '@/design-system';
import { PageTemplate } from '@/design-system';

interface NewsDetailClientProps {
  article: any;
}

export function NewsDetailClient({ article }: NewsDetailClientProps) {
  const navItems = [
    { label: 'Events', href: '/events' },
    { label: 'Music', href: '/music' },
    { label: 'Shop', href: '/shop' },
    { label: 'Membership', href: '/membership' },
  ];

  return (
    <PageTemplate
      headerProps={{
        logoText: 'GVTEWAY',
        navItems,
        showAuth: true,
      }}
    >
      <Container maxWidth="md">
        <Stack gap={6}>
          <Stack gap={4}>
            <Heading level={1} font="anton">
              {article.title}
            </Heading>
            {article.published_at && (
              <Text size="sm" color="tertiary">
                {new Date(article.published_at).toLocaleDateString()}
              </Text>
            )}
          </Stack>

          {article.content && (
            <Text size="lg">
              {article.content}
            </Text>
          )}
        </Stack>
      </Container>
    </PageTemplate>
  );
}
