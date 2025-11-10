'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './artist-card.module.css';

interface ArtistCardProps {
  artist: {
    id: string;
    name: string;
    slug: string;
    bio?: string;
    image_url?: string;
    genre_tags?: string[];
  };
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link href={`/artists/${artist.slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {artist.image_url ? (
          <Image
            src={artist.image_url}
            alt={artist.name}
            fill
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{artist.name}</h3>
        {artist.genre_tags && artist.genre_tags.length > 0 && (
          <div className={styles.genres}>
            {artist.genre_tags.slice(0, 2).map((genre) => (
              <span key={genre} className={styles.genreTag}>
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
