'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Ticket } from 'lucide-react';
import { useCart } from '@/lib/store/cart-store';
import { toast } from 'sonner';
import styles from './ticket-selector.module.css';

interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity_available: number;
  quantity_sold: number;
  max_per_order?: number;
  perks?: string[];
}

interface TicketSelectorProps {
  ticketTypes: TicketType[];
  eventId: string;
  eventName: string;
  eventSlug: string;
}

export function TicketSelector({ ticketTypes, eventId, eventName, eventSlug }: TicketSelectorProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const addItem = useCart((state) => state.addItem);

  const handleQuantityChange = (ticketTypeId: string, change: number) => {
    const ticketType = ticketTypes.find(t => t.id === ticketTypeId);
    if (!ticketType) return;

    const currentQty = quantities[ticketTypeId] || 0;
    const newQty = Math.max(0, currentQty + change);
    const available = ticketType.quantity_available - ticketType.quantity_sold;
    const maxAllowed = ticketType.max_per_order || 10;

    if (newQty > available) {
      toast.error(`Only ${available} tickets available`);
      return;
    }

    if (newQty > maxAllowed) {
      toast.error(`Maximum ${maxAllowed} tickets per order`);
      return;
    }

    setQuantities(prev => ({
      ...prev,
      [ticketTypeId]: newQty,
    }));
  };

  const handleAddToCart = (ticketType: TicketType) => {
    const quantity = quantities[ticketType.id] || 1;
    
    if (quantity === 0) {
      toast.error('Please select a quantity');
      return;
    }

    addItem({
      id: ticketType.id,
      name: `${eventName} - ${ticketType.name}`,
      price: ticketType.price,
      quantity,
      type: 'ticket',
      metadata: {
        eventId,
        eventName,
        eventSlug,
        ticketTypeId: ticketType.id,
        ticketTypeName: ticketType.name,
      },
    });

    toast.success(`Added ${quantity} ticket(s) to cart`);
    
    // Reset quantity for this ticket type
    setQuantities(prev => ({
      ...prev,
      [ticketType.id]: 0,
    }));
  };

  if (!ticketTypes || ticketTypes.length === 0) {
    return (
      <Card className={styles.card}>
        <CardContent className={styles.content}>
          <p className={styles.emptyState}>Tickets coming soon!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={styles.card}>
      <CardContent className={styles.content}>
        <h2 className={styles.header}>
          <Ticket className={styles.headerIcon} />
          Tickets
        </h2>
        
        <div className={styles.ticketList}>
          {ticketTypes.map((ticket) => {
            const available = ticket.quantity_available - ticket.quantity_sold;
            const isSoldOut = available <= 0;
            const quantity = quantities[ticket.id] || 0;
            
            return (
              <div
                key={ticket.id}
                className={styles.ticketItem}
              >
                <div className={styles.ticketHeader}>
                  <div className={styles.ticketInfo}>
                    <h3 className={styles.ticketName}>{ticket.name}</h3>
                    {ticket.description && (
                      <p className={styles.ticketDescription}>{ticket.description}</p>
                    )}
                  </div>
                  <div className={styles.ticketPriceContainer}>
                    <p className={styles.ticketPrice}>
                      ${ticket.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {ticket.perks && ticket.perks.length > 0 && (
                  <ul className={styles.perksList}>
                    {ticket.perks.map((perk, i) => (
                      <li key={i} className={styles.perkItem}>
                        <span className={styles.perkBullet}>•</span>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className={styles.ticketFooter}>
                  <span className={styles.availability}>
                    {isSoldOut ? (
                      <span className={styles.soldOut}>Sold Out</span>
                    ) : (
                      `${available} available`
                    )}
                  </span>
                  
                  {!isSoldOut && (
                    <div className={styles.controls}>
                      <div className={styles.quantityControl}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleQuantityChange(ticket.id, -1)}
                          disabled={quantity === 0}
                          className={styles.quantityButton}
                        >
                          <Minus className={styles.quantityIcon} />
                        </Button>
                        <span className={styles.quantityDisplay}>{quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleQuantityChange(ticket.id, 1)}
                          className={styles.quantityButton}
                        >
                          <Plus className={styles.quantityIcon} />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(ticket)}
                        disabled={quantity === 0}
                        className={styles.addButton}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
