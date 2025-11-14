/**
 * FavoritesList Organism
 * GHXSTSHIP Design System
 * List of favorited items (events, artists, etc.)
 */

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import styles from './FavoritesList.module.css';

export interface Favorite {
  id: string;
  type: 'event' | 'artist';
  name: string;
  image_url?: string;
  href: string;
}

export interface FavoritesListProps {
  favorites: Favorite[];
}

export function FavoritesList({ favorites }: FavoritesListProps) {
  if (favorites.length === 0) {
    return (
      <div className={styles.empty}>
        <Heart className={styles.emptyIcon} />
        <p className={styles.emptyText}>No favorites yet</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {favorites.map((favorite) => (
        <Link key={favorite.id} href={favorite.href} className={styles.item}>
          {favorite.image_url && (
            <div className={styles.image}>
              <img src={favorite.image_url} alt={favorite.name} />
            </div>
          )}
          <div className={styles.content}>
            <h3 className={styles.name}>{favorite.name}</h3>
            <span className={styles.type}>{favorite.type}</span>
          </div>
          <Heart className={styles.icon} />
        </Link>
      ))}
    </div>
  );
}
