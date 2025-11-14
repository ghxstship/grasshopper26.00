/**
 * ArtistCard - Artist display card molecule
 * GHXSTSHIP Atomic Design System
 */

import Image from 'next/image';
import Link from 'next/link';
import { Card, Stack, Heading, Text } from '../../atoms';
import styles from './ArtistCard.module.css';

export interface ArtistCardProps {
  /** Artist name */
  name: string;
  /** Artist genre */
  genre?: string;
  /** Artist image */
  image?: string;
  /** Artist slug/link */
  slug: string;
  /** Upcoming events count */
  upcomingEvents?: number;
}

export function ArtistCard({
  name,
  genre,
  image,
  slug,
  upcomingEvents,
}: ArtistCardProps) {
  return (
    <Card variant="elevated" padding={0} interactive>
      <Link href={`/music/${slug}`} className={styles.link}>
        {image && (
          <div className={styles.imageContainer}>
            <Image
              src={image}
              alt={name}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <Stack gap={2} className={styles.content}>
          <Heading level={4} font="bebas">
            {name}
          </Heading>

          {genre && (
            <Text size="sm" color="secondary" uppercase>
              {genre}
            </Text>
          )}

          {upcomingEvents !== undefined && upcomingEvents > 0 && (
            <Text size="sm" font="bebas">
              {upcomingEvents} Upcoming {upcomingEvents === 1 ? 'Event' : 'Events'}
            </Text>
          )}
        </Stack>
      </Link>
    </Card>
  );
}
