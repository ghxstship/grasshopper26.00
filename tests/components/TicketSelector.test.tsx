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

  it('should render all ticket types', () => {
    render(<TicketSelector tickets={mockTickets} />);
    
    expect(screen.getByText('General Admission')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
  });

  it('should display prices correctly', () => {
    render(<TicketSelector tickets={mockTickets} />);
    
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
  });

  it('should show availability count', () => {
    render(<TicketSelector tickets={mockTickets} />);
    
    expect(screen.getByText(/100 available/i)).toBeInTheDocument();
    expect(screen.getByText(/20 available/i)).toBeInTheDocument();
  });

  it('should handle ticket selection', async () => {
    const handleSelect = vi.fn();
    render(<TicketSelector tickets={mockTickets} onTicketSelect={handleSelect} />);
    
    const generalTicket = screen.getByText('General Admission').closest('div');
    if (generalTicket) {
      fireEvent.click(generalTicket);
      
      await waitFor(() => {
        expect(handleSelect).toHaveBeenCalledWith('general', 1);
      });
    }
  });

  it('should show selected tickets', () => {
    render(
      <TicketSelector 
        tickets={mockTickets} 
        selectedTickets={{ general: 2 }}
      />
    );
    
    expect(screen.getByText(/2 TICKET/i)).toBeInTheDocument();
  });

  it('should toggle ticket selection', async () => {
    const handleSelect = vi.fn();
    render(
      <TicketSelector 
        tickets={mockTickets} 
        selectedTickets={{ general: 1 }}
        onTicketSelect={handleSelect}
      />
    );
    
    const generalTicket = screen.getByText('General Admission').closest('div');
    if (generalTicket) {
      fireEvent.click(generalTicket);
      
      await waitFor(() => {
        expect(handleSelect).toHaveBeenCalledWith('general', 0);
      });
    }
  });

  it('should disable sold out ticket types', () => {
    const soldOutTickets = [
      { ...mockTickets[0], available: 0 },
    ];
    
    render(<TicketSelector tickets={soldOutTickets} />);
    
    expect(screen.getByText(/sold out/i)).toBeInTheDocument();
    const incrementButton = screen.getByRole('button', { name: /increment/i });
    expect(incrementButton).toBeDisabled();
  });

  it('should calculate total price', () => {
    render(
      <TicketSelector 
        tickets={mockTickets}
        selectedTickets={{ general: 2, vip: 1 }}
      />
    );
    
    expect(screen.getByText(/total/i)).toBeInTheDocument();
    expect(screen.getByText(/\$250/i)).toBeInTheDocument();
  });

  it('should show checkout button when tickets selected', () => {
    const handleCheckout = vi.fn();
    render(
      <TicketSelector 
        tickets={mockTickets}
        selectedTickets={{ general: 2 }}
        onCheckout={handleCheckout}
      />
    );
    
    const checkoutButton = screen.getByText(/checkout/i);
    expect(checkoutButton).toBeInTheDocument();
    fireEvent.click(checkoutButton);
    expect(handleCheckout).toHaveBeenCalled();
  });

  it('should be keyboard navigable', () => {
    render(<TicketSelector tickets={mockTickets} />);
    
    const firstTicketType = screen.getByText('General Admission').closest('div');
    expect(firstTicketType).toHaveAttribute('tabIndex', '0');
  });
});
