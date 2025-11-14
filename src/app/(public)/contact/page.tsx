import { Metadata } from 'next';
import { PageTemplate, Heading, Text, Stack } from '@/design-system';

export const metadata: Metadata = {
  title: 'Contact - GVTEWAY',
  description: 'Get in touch with GVTEWAY',
};

export default function ContactPage() {
  return (
    <PageTemplate>
      <Stack gap={8}>
        <Heading level={1} font="anton">
          Contact Us
        </Heading>
        <Stack gap={4}>
          <Text size="lg">
            Have questions? We&apos;re here to help.
          </Text>
          <Text>
            Email: <strong>support@gvteway.com</strong>
          </Text>
          <Text>
            For press inquiries: <strong>press@gvteway.com</strong>
          </Text>
        </Stack>
      </Stack>
    </PageTemplate>
  );
}
