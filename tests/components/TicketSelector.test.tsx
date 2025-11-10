/**
 * TicketSelector Component Tests
 * Tests ticket type selection and quantity controls
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TicketSelector } from '@/design-system/components/organisms/TicketSelector/TicketSelector';

describe('TicketSelector Component', () => {
  const mockTicketTypes = [
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
    render(<TicketSelector ticketTypes={mockTicketTypes} />);
    
    expect(screen.getByText('General Admission')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
  });

  it('should display prices correctly', () => {
    render(<TicketSelector ticketTypes={mockTicketTypes} />);
    
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
  });

  it('should show availability count', () => {
    render(<TicketSelector ticketTypes={mockTicketTypes} />);
    
    expect(screen.getByText(/100 available/i)).toBeInTheDocument();
    expect(screen.getByText(/20 available/i)).toBeInTheDocument();
  });

  it('should increment quantity', async () => {
    const handleChange = vi.fn();
    render(<TicketSelector ticketTypes={mockTicketTypes} onChange={handleChange} />);
    
    const incrementButton = screen.getAllByRole('button', { name: /increment/i })[0];
    fireEvent.click(incrementButton);
    
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith({
        ticketTypeId: 'general',
        quantity: 1,
      });
    });
  });

  it('should decrement quantity', async () => {
    const handleChange = vi.fn();
    render(
      <TicketSelector 
        ticketTypes={mockTicketTypes} 
        onChange={handleChange}
        initialQuantity={{ general: 2 }}
      />
    );
    
    const decrementButton = screen.getAllByRole('button', { name: /decrement/i })[0];
    fireEvent.click(decrementButton);
    
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith({
        ticketTypeId: 'general',
        quantity: 1,
      });
    });
  });

  it('should not allow quantity below 0', () => {
    const handleChange = vi.fn();
    render(<TicketSelector ticketTypes={mockTicketTypes} onChange={handleChange} />);
    
    const decrementButton = screen.getAllByRole('button', { name: /decrement/i })[0];
    fireEvent.click(decrementButton);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should enforce maximum quantity limit', async () => {
    const handleChange = vi.fn();
    render(
      <TicketSelector 
        ticketTypes={mockTicketTypes} 
        onChange={handleChange}
        maxPerOrder={10}
        initialQuantity={{ general: 10 }}
      />
    );
    
    const incrementButton = screen.getAllByRole('button', { name: /increment/i })[0];
    fireEvent.click(incrementButton);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should disable sold out ticket types', () => {
    const soldOutTickets = [
      { ...mockTicketTypes[0], available: 0 },
    ];
    
    render(<TicketSelector ticketTypes={soldOutTickets} />);
    
    expect(screen.getByText(/sold out/i)).toBeInTheDocument();
    const incrementButton = screen.getByRole('button', { name: /increment/i });
    expect(incrementButton).toBeDisabled();
  });

  it('should calculate total price', () => {
    render(
      <TicketSelector 
        ticketTypes={mockTicketTypes}
        initialQuantity={{ general: 2, vip: 1 }}
      />
    );
    
    expect(screen.getByText(/total.*\$250\.00/i)).toBeInTheDocument();
  });

  it('should apply membership discount', () => {
    render(
      <TicketSelector 
        ticketTypes={mockTicketTypes}
        initialQuantity={{ general: 2 }}
        membershipDiscount={0.1}
      />
    );
    
    expect(screen.getByText(/discount/i)).toBeInTheDocument();
    expect(screen.getByText(/\$90\.00/i)).toBeInTheDocument();
  });

  it('should be keyboard navigable', () => {
    render(<TicketSelector ticketTypes={mockTicketTypes} />);
    
    const firstTicketType = screen.getByText('General Admission').closest('div');
    expect(firstTicketType).toHaveAttribute('tabIndex', '0');
  });
});
