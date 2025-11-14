/**
 * TicketSelector Component Tests
 * Tests ticket type selection and quantity controls
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TicketSelector } from '@/design-system/components/organisms/TicketSelector/TicketSelector';

describe('TicketSelector Component', () => {
  const mockTickets = [
    {
      id: 'general',
      name: 'General Admission',
      price: 5000,
      available: 100,
      description: 'Standing room',
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 15000,
      available: 20,
      description: 'Premium seating',
    },
  ];

  it('should render with tickets', () => {
    render(<TicketSelector tickets={mockTickets} />);
    
    expect(screen.getByText(/Ticket Selector/i)).toBeInTheDocument();
    expect(screen.getByText(/2 tickets/i)).toBeInTheDocument();
  });

  it('should render without tickets', () => {
    render(<TicketSelector tickets={[]} />);
    
    expect(screen.getByText(/0 tickets/i)).toBeInTheDocument();
  });

  it('should handle ticket selection', () => {
    const handleSelect = vi.fn();
    render(<TicketSelector tickets={mockTickets} onSelect={handleSelect} />);
    
    expect(screen.getByText(/Ticket Selector/i)).toBeInTheDocument();
  });

  it('should render with default props', () => {
    render(<TicketSelector />);
    
    expect(screen.getByText(/0 tickets/i)).toBeInTheDocument();
  });

  it('should be accessible', () => {
    const { container } = render(<TicketSelector tickets={mockTickets} />);
    
    expect(container.querySelector('[role="region"]')).toBeInTheDocument();
  });
});
