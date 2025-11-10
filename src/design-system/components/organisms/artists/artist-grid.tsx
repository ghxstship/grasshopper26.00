/**
 * Artist Grid Component
 * Displays artists in a responsive grid
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HalftoneOverlay } from '@/design-system/components/atoms/halftone-overlay';
import styles from './artist-grid.module.css';

interface Artist {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  profile_image_url?: string;
  genre_tags?: string[];
  verified?: boolean;
}

interface ArtistGridProps {
  artists: Artist[];
}

export function ArtistGrid({ artists }: ArtistGridProps) {
  return (
    <div className={styles.grid}>
      {artists.map((artist) => (
        <Link
          key={artist.id}
          href={`/artists/${artist.slug}`}
          className="group"
        >
          <article className={styles.card}>
            {/* Artist Image */}
            <div className={styles.card}>
              {artist.profile_image_url ? (
                <HalftoneOverlay preset="medium" opacity={0.3}>
                  <Image
                    src={artist.profile_image_url}
                    alt={artist.name}
                    fill
                    className="object-cover"
                  />
                </HalftoneOverlay>
              ) : (
                <div className={styles.row}>
                  <span className={styles.text}>
                    {artist.name.charAt(0)}
                  </span>
                </div>
              )}
              
              {/* Verified Badge */}
              {artist.verified && (
                <div className={styles.card}>
                  <span className={styles.container}>
                    VERIFIED
                  </span>
                </div>
              )}
            </div>

            {/* Artist Info */}
            <div className={styles.card}>
              <h3 className={styles.container}>
                {artist.name}
              </h3>
              
              {/* Genre Tags */}
              {artist.genre_tags && artist.genre_tags.length > 0 && (
                <div className={styles.container}>
                  {artist.genre_tags.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className={styles.card}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Bio Preview */}
              {artist.bio && (
                <p className={styles.text}>
                  {artist.bio}
                </p>
              )}
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
