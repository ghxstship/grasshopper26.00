/**
 * ArtistsGrid - Artists grid organism
 * GHXSTSHIP Atomic Design System
 */

import { Grid, Stack, Heading } from '../../atoms';
import { ArtistCard, ArtistCardProps } from '../../molecules/ArtistCard';

export interface ArtistsGridProps {
  /** Section title */
  title?: string;
  /** Artists to display */
  artists: ArtistCardProps[];
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;
}

export function ArtistsGrid({
  title,
  artists,
  columns = 4,
}: ArtistsGridProps) {
  return (
    <Stack gap={8}>
      {title && (
        <Heading level={2} font="bebas">
          {title}
        </Heading>
      )}

      <Grid columns={columns} gap={6} responsive>
        {artists.map((artist) => (
          <ArtistCard key={artist.slug} {...artist} />
        ))}
      </Grid>
    </Stack>
  );
}
