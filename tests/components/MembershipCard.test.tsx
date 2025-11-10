/**
 * MembershipCard Component Tests
 * Tests membership tier display and subscription actions
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MembershipCard } from '@/design-system/components/organisms/MembershipCard/MembershipCard';

describe('MembershipCard Component', () => {
  const mockTier = {
    id: 'premium',
    name: 'Premium',
    price: 2999,
    interval: 'month' as const,
    credits: 10,
    benefits: [
      'Priority access to tickets',
      '10% discount on all purchases',
      'Exclusive member events',
    ],
    popular: true,
  };

  it('should render tier information', () => {
    render(<MembershipCard tier={mockTier} />);
    
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText(/month/i)).toBeInTheDocument();
  });

  it('should display all benefits', () => {
    render(<MembershipCard tier={mockTier} />);
    
    mockTier.benefits.forEach(benefit => {
      expect(screen.getByText(benefit)).toBeInTheDocument();
    });
  });

  it('should show popular badge', () => {
    render(<MembershipCard tier={mockTier} />);
    
    expect(screen.getByText(/popular/i)).toBeInTheDocument();
  });

  it('should not show popular badge for non-popular tiers', () => {
    const nonPopularTier = { ...mockTier, popular: false };
    render(<MembershipCard tier={nonPopularTier} />);
    
    expect(screen.queryByText(/popular/i)).not.toBeInTheDocument();
  });

  it('should display credits allocation', () => {
    render(<MembershipCard tier={mockTier} />);
    
    expect(screen.getByText(/10 credits/i)).toBeInTheDocument();
  });

  it('should call onSubscribe when button clicked', () => {
    const handleSubscribe = vi.fn();
    render(<MembershipCard tier={mockTier} onSubscribe={handleSubscribe} />);
    
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
    fireEvent.click(subscribeButton);
    
    expect(handleSubscribe).toHaveBeenCalledWith(mockTier.id);
  });

  it('should show current membership indicator', () => {
    render(<MembershipCard tier={mockTier} isCurrent />);
    
    expect(screen.getByText(/current plan/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /subscribe/i })).not.toBeInTheDocument();
  });

  it('should disable button when loading', () => {
    render(<MembershipCard tier={mockTier} loading />);
    
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
    expect(subscribeButton).toBeDisabled();
  });

  it('should show annual savings for yearly plans', () => {
    const yearlyTier = { ...mockTier, interval: 'year' as const, price: 29999 };
    render(<MembershipCard tier={yearlyTier} />);
    
    expect(screen.getByText(/save.*year/i)).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<MembershipCard tier={mockTier} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Premium'));
  });

  it('should highlight recommended tier', () => {
    render(<MembershipCard tier={mockTier} recommended />);
    
    expect(screen.getByText(/recommended/i)).toBeInTheDocument();
  });
});
