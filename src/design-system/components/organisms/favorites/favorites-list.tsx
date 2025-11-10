'use client';
export function FavoritesList({ favorites }: { favorites: any[] }) {
  return <div>{favorites.length} favorites</div>;
}
