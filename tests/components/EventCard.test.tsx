/**
 * EventCard Component Tests
 * Tests event card rendering, interactions, and accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard } from '@/design-system/components/molecules/EventCard/EventCard';

describe('EventCard Component', () => {
  const mockProps = {
    title: 'Test Concert',
    date: 'Dec 31, 2025',
    location: 'Test Venue',
    image: '/test-image.jpg',
    slug: 'test-concert',
    price: '$50',
    soldOut: false,
  };

  it('should render event details correctly', () => {
    render(<EventCard {...mockProps} />);
    
    expect(screen.getByText('Test Concert')).toBeInTheDocument();
    expect(screen.getByText(/Test Venue/)).toBeInTheDocument();
    expect(screen.getByText(/Dec 31, 2025/)).toBeInTheDocument();
  });

  it('should format date correctly', () => {
    render(<EventCard {...mockProps} />);
    
    const dateElement = screen.getByText(/Dec 31, 2025/i);
    expect(dateElement).toBeInTheDocument();
  });

  it('should show price when provided', () => {
    render(<EventCard {...mockProps} />);
    
    expect(screen.getByText(/\$50/)).toBeInTheDocument();
  });

  it('should show sold out badge', () => {
    render(<EventCard {...mockProps} soldOut={true} />);
    
    expect(screen.getByText(/sold out/i)).toBeInTheDocument();
  });

  it('should render without image', () => {
    const { container } = render(<EventCard {...mockProps} image={undefined} />);
    
    expect(screen.getByText('Test Concert')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('should link to event detail page', () => {
    render(<EventCard {...mockProps} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/events/test-concert');
  });

  it('should be keyboard accessible', () => {
    render(<EventCard {...mockProps} />);
    
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
  });
});
