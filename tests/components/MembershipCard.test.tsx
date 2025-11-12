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
    start_date: '2024-01-01',
    membership_tiers: {
      tier_level: 2,
      display_name: 'Premium Member',
    },
  };

  const mockProfile = {
    id: 'profile-123',
    display_name: 'John Doe',
  };

  it('should render membership information', () => {
    render(<MembershipCard membership={mockMembership} profile={mockProfile} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Premium Member')).toBeInTheDocument();
  });

  it('should display member since year', () => {
    render(<MembershipCard membership={mockMembership} profile={mockProfile} />);
    
    expect(screen.getByText(/Member Since 2024/i)).toBeInTheDocument();
  });

  it('should display tier level badge', () => {
    render(<MembershipCard membership={mockMembership} profile={mockProfile} />);
    
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should show GVTEWAY branding', () => {
    render(<MembershipCard membership={mockMembership} profile={mockProfile} />);
    
    expect(screen.getByText('GVTEWAY')).toBeInTheDocument();
  });

  it('should render without membership (join prompt)', () => {
    render(<MembershipCard membership={null} profile={mockProfile} />);
    
    expect(screen.getByText(/Join GVTEWAY Membership/i)).toBeInTheDocument();
    expect(screen.getByText(/Unlock exclusive benefits/i)).toBeInTheDocument();
  });
});
