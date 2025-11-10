/**
 * FavoriteButton Component Tests
 * Tests favorite/wishlist functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FavoriteButton } from '@/design-system/components/atoms/FavoriteButton/FavoriteButton';

// Mock favorites store
vi.mock('@/lib/stores/favorites-store', () => ({
  useFavoritesStore: vi.fn(() => ({
    favorites: [],
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
  })),
}));

describe('FavoriteButton', () => {
  const mockItem = {
    id: 'event-123',
    name: 'Summer Festival',
    type: 'event',
  };

  it('should render favorite button', () => {
    render(<FavoriteButton item={mockItem} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should show unfavorited state by default', () => {
    render(<FavoriteButton item={mockItem} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('should show favorited state when item is favorited', async () => {
    const { useFavoritesStore } = await import('@/lib/stores/favorites-store');
    vi.mocked(useFavoritesStore).mockReturnValue({
      favorites: [mockItem.id],
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      isFavorite: vi.fn(() => true),
    } as any);

    render(<FavoriteButton item={mockItem} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should add to favorites when clicked', async () => {
    const { useFavoritesStore } = await import('@/lib/stores/favorites-store');
    const mockAddFavorite = vi.fn();
    vi.mocked(useFavoritesStore).mockReturnValue({
      favorites: [],
      addFavorite: mockAddFavorite,
      removeFavorite: vi.fn(),
      isFavorite: vi.fn(() => false),
    } as any);

    render(<FavoriteButton item={mockItem} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockAddFavorite).toHaveBeenCalledWith(mockItem.id);
  });

  it('should remove from favorites when clicked if already favorited', async () => {
    const { useFavoritesStore } = await import('@/lib/stores/favorites-store');
    const mockRemoveFavorite = vi.fn();
    vi.mocked(useFavoritesStore).mockReturnValue({
      favorites: [mockItem.id],
      addFavorite: vi.fn(),
      removeFavorite: mockRemoveFavorite,
      isFavorite: vi.fn(() => true),
    } as any);

    render(<FavoriteButton item={mockItem} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockRemoveFavorite).toHaveBeenCalledWith(mockItem.id);
  });

  it('should have accessible label', () => {
    render(<FavoriteButton item={mockItem} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName(/favorite|add to favorites/i);
  });

  it('should show tooltip on hover', async () => {
    render(<FavoriteButton item={mockItem} showTooltip />);

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    // Tooltip should appear
    expect(screen.queryByRole('tooltip')).toBeInTheDocument();
  });
});
