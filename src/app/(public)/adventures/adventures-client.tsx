/**
 * Adventures Browse Client
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { useState } from 'react';
import { Stack, Heading, Text, Grid, Card } from '@/design-system';
import { PageTemplate } from '@/design-system';

interface Adventure {
  id: string;
  name: string;
  description: string;
  adventure_type: string;
  location_name: string;
  featured: boolean;
}

interface AdventuresBrowseClientProps {
  initialAdventures: Adventure[];
  initialSearch?: string;
}

export function AdventuresBrowseClient({ initialAdventures, initialSearch }: AdventuresBrowseClientProps) {
  const [adventures] = useState<Adventure[]>(initialAdventures);
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
            Adventures
          </Heading>
          <Text size="xl" align="center" color="secondary">
            Discover unique experiences and adventures
          </Text>
        </Stack>

        {adventures.length === 0 ? (
          <Card variant="outlined" padding={6}>
            <Stack gap={2} align="center">
              <Text align="center" color="secondary">
                No adventures found{searchTerm ? ` for "${searchTerm}"` : ''}.
              </Text>
            </Stack>
          </Card>
        ) : (
          <Grid columns={3} gap={6} responsive>
            {adventures.map((adventure) => (
              <Card key={adventure.id} variant="elevated" padding={6}>
                <Stack gap={3}>
                  <Heading level={3} font="bebas">
                    {adventure.name}
                  </Heading>
                  <Text size="sm" color="secondary">
                    {adventure.location_name}
                  </Text>
                  <Text>{adventure.description}</Text>
                </Stack>
              </Card>
            ))}
          </Grid>
        )}
      </Stack>
    </PageTemplate>
  );
}
