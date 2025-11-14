import { Metadata } from 'next';
import { PageTemplate, Heading, Text, Stack } from '@/design-system';

export const metadata: Metadata = {
  title: 'Venues - GVTEWAY',
  description: 'Explore venues hosting GVTEWAY events',
};

export default function VenuesPage() {
  return (
    <PageTemplate>
      <Stack gap={8}>
        <Heading level={1} font="anton">
          Venues
        </Heading>
        <Text size="lg">
          Discover the incredible venues hosting GVTEWAY events across the country.
        </Text>
        <Text>
          Check back soon for our full venue directory.
        </Text>
      </Stack>
    </PageTemplate>
  );
}
