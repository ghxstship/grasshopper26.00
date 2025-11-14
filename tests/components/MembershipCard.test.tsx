/**
 * MembershipCard Component Tests
 * Tests membership tier display and subscription actions
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MembershipCard } from '@/design-system/components/organisms/MembershipCard/MembershipCard';

describe('MembershipCard Component', () => {
  const mockMembership = {
    id: 'membership-123',
    name: 'Premium Member',
    type: 'annual',
    start_date: '2024-01-01',
    tier_level: 2,
  };

  it('should render membership information', () => {
    render(<MembershipCard membership={mockMembership} />);
    
    expect(screen.getByText('Premium Member')).toBeInTheDocument();
  });

  it('should display membership type', () => {
    render(<MembershipCard membership={mockMembership} />);
    
    expect(screen.getByText('annual')).toBeInTheDocument();
  });

  it('should render with minimal data', () => {
    const minimalMembership = { id: 'test-123' };
    render(<MembershipCard membership={minimalMembership} />);
    
    expect(screen.getByText('Membership')).toBeInTheDocument();
  });

  it('should render without membership', () => {
    render(<MembershipCard membership={null} />);
    
    expect(screen.getByText('Membership')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    const { container } = render(<MembershipCard membership={mockMembership} />);
    
    expect(container.querySelector('h3')).toBeInTheDocument();
  });
});
