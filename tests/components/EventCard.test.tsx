/**
 * EventCard Component Tests
 * Tests event card rendering, interactions, and accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard } from '@/design-system/components/molecules/EventCard/EventCard';

describe('EventCard Component', () => {
  const mockEvent = {
    id: 'event-123',
    name: 'Test Concert',
    date: 'Dec 31, 2025',
    venue: 'Test Venue',
    imageUrl: '/test-image.jpg',
    status: 'on-sale' as const,
  };

  it('should render event details correctly', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Test Concert')).toBeInTheDocument();
    expect(screen.getByText(/Test Venue/)).toBeInTheDocument();
    expect(screen.getByText(/Dec 31, 2025/)).toBeInTheDocument();
  });

  it('should format date correctly', () => {
    render(<EventCard event={mockEvent} />);
    
    const dateElement = screen.getByText(/Dec 31, 2025/i);
    expect(dateElement).toBeInTheDocument();
  });

  it('should show on-sale status badge', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText(/on sale/i)).toBeInTheDocument();
  });

  it('should show sold out badge', () => {
    const soldOutEvent = { ...mockEvent, status: 'sold-out' as const };
    render(<EventCard event={soldOutEvent} />);
    
    expect(screen.getByText(/sold out/i)).toBeInTheDocument();
  });

  it('should show coming soon badge', () => {
    const comingSoonEvent = { ...mockEvent, status: 'coming-soon' as const };
    render(<EventCard event={comingSoonEvent} />);
    
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    const handleClick = vi.fn();
    render(<EventCard event={mockEvent} onClick={handleClick} />);
    
    const card = screen.getByText('Test Concert').closest('div');
    if (card) {
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalled();
    }
  });

  it('should be keyboard accessible', () => {
    const handleClick = vi.fn();
    render(<EventCard event={mockEvent} onClick={handleClick} />);
    
    const card = screen.getByText('Test Concert').closest('div');
    if (card) {
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    }
  });
});
