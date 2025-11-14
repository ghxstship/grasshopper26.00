import { Metadata } from 'next';
import { PageTemplate, Heading, Text, Stack } from '@/design-system';

export const metadata: Metadata = {
  title: 'About - GVTEWAY',
  description: 'Learn about GVTEWAY and our mission to bring you exclusive events and experiences',
};

export default function AboutPage() {
  return (
    <PageTemplate>
      <Stack gap={8}>
        <Heading level={1} font="anton">
          About GVTEWAY
        </Heading>
        <Text size="lg">
          GVTEWAY is your gateway to exclusive events, premium experiences, and unforgettable moments.
        </Text>
        <Text>
          We connect fans with the artists, events, and experiences they love through innovative technology
          and exceptional service.
        </Text>
      </Stack>
    </PageTemplate>
  );
}
