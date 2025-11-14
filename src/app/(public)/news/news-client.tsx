/**
 * News Browse Client
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { useState } from 'react';
import { Stack, Heading, Text, Grid, Card } from '@/design-system';
import { PageTemplate } from '@/design-system';
import Link from 'next/link';

interface NewsBrowseClientProps {
  initialArticles: any[];
  initialSearch?: string;
}

export function NewsBrowseClient({ initialArticles, initialSearch }: NewsBrowseClientProps) {
  const [articles] = useState(initialArticles);
  const [searchTerm] = useState(initialSearch || '');

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
      <Stack gap={8}>
        <Stack gap={4} align="center">
          <Heading level={1} font="anton" align="center">
            News
          </Heading>
          <Text size="xl" align="center" color="secondary">
            Latest updates and announcements
          </Text>
        </Stack>

        {articles.length === 0 ? (
          <Card variant="outlined" padding={6}>
            <Text align="center" color="secondary">
              No news articles found{searchTerm ? ` for "${searchTerm}"` : ''}.
            </Text>
          </Card>
        ) : (
          <Grid columns={2} gap={6} responsive>
            {articles.map((article) => (
              <Link key={article.id} href={`/news/${article.slug}`}>
                <Card variant="elevated" padding={6}>
                  <Stack gap={3}>
                    <Heading level={3} font="bebas">
                      {article.title}
                    </Heading>
                    {article.excerpt && (
                      <Text color="secondary">{article.excerpt}</Text>
                    )}
                  </Stack>
                </Card>
              </Link>
            ))}
          </Grid>
        )}
      </Stack>
    </PageTemplate>
  );
}
