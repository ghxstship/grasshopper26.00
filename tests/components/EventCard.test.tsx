/**
 * EventCard Component Tests
 * Tests event card rendering, interactions, and accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard } from '@/components/features/events/EventCard';

describe('EventCard Component', () => {
  const mockEvent = {
    id: 'event-123',
    title: 'Test Concert',
    description: 'Amazing live performance',
    date: '2025-12-31T20:00:00Z',
    venue: {
      name: 'Test Venue',
      city: 'New York',
    },
    artists: [
      { id: 'artist-1', name: 'Test Artist' },
    ],
    imageUrl: '/test-image.jpg',
    ticketsAvailable: 100,
    minPrice: 5000,
  };

  it('should render event details correctly', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Test Concert')).toBeInTheDocument();
    expect(screen.getByText('Test Venue')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('should format date correctly', () => {
    render(<EventCard event={mockEvent} />);
    
    const dateElement = screen.getByText(/Dec 31, 2025/i);
    expect(dateElement).toBeInTheDocument();
  });

  it('should format price correctly', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText(/\$50/)).toBeInTheDocument();
  });

  it('should show sold out badge when no tickets available', () => {
    const soldOutEvent = { ...mockEvent, ticketsAvailable: 0 };
    render(<EventCard event={soldOutEvent} />);
    
    expect(screen.getByText(/sold out/i)).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    const handleClick = vi.fn();
    render(<EventCard event={mockEvent} onClick={handleClick} />);
    
    const card = screen.getByRole('article');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledWith(mockEvent.id);
  });

  it('should be keyboard accessible', () => {
    const handleClick = vi.fn();
    render(<EventCard event={mockEvent} onClick={handleClick} />);
    
    const card = screen.getByRole('article');
    fireEvent.keyDown(card, { key: 'Enter' });
    
    expect(handleClick).toHaveBeenCalled();
  });

  it('should have proper ARIA labels', () => {
    render(<EventCard event={mockEvent} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Test Concert'));
  });

  it('should display favorite button', () => {
    render(<EventCard event={mockEvent} showFavorite />);
    
    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    expect(favoriteButton).toBeInTheDocument();
  });

  it('should handle favorite toggle', () => {
    const handleFavorite = vi.fn();
    render(<EventCard event={mockEvent} showFavorite onFavorite={handleFavorite} />);
    
    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    fireEvent.click(favoriteButton);
    
    expect(handleFavorite).toHaveBeenCalledWith(mockEvent.id);
  });

  it('should show loading state', () => {
    render(<EventCard event={mockEvent} loading />);
    
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });
});
