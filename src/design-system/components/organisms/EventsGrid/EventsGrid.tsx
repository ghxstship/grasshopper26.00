/**
 * EventsGrid - Events grid organism
 * GHXSTSHIP Atomic Design System
 */

import { Grid, Stack, Heading } from '../../atoms';
import { EventCard, EventCardProps } from '../../molecules';

export interface EventsGridProps {
  /** Section title */
  title?: string;
  /** Events to display */
  events: EventCardProps[];
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;
}

export function EventsGrid({
  title,
  events,
  columns = 3,
}: EventsGridProps) {
  return (
    <Stack gap={8}>
      {title && (
        <Heading level={2} font="bebas">
          {title}
        </Heading>
      )}

      <Grid columns={columns} gap={6} responsive>
        {events.map((event) => (
          <EventCard key={event.slug} {...event} />
        ))}
      </Grid>
    </Stack>
  );
}
