'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Ticket } from 'lucide-react';
import { useCart } from '@/lib/store/cart-store';
import { toast } from 'sonner';

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
      <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
        <CardContent className="p-6">
          <p className="text-gray-400">Tickets coming soon!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <Ticket className="h-6 w-6" />
          Tickets
        </h2>
        
        <div className="space-y-4">
          {ticketTypes.map((ticket) => {
            const available = ticket.quantity_available - ticket.quantity_sold;
            const isSoldOut = available <= 0;
            const quantity = quantities[ticket.id] || 0;
            
            return (
              <div
                key={ticket.id}
                className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/20"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-white">{ticket.name}</h3>
                    {ticket.description && (
                      <p className="text-sm text-gray-400 mt-1">{ticket.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-purple-400">
                      ${ticket.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {ticket.perks && ticket.perks.length > 0 && (
                  <ul className="text-sm text-gray-400 space-y-1 mb-3">
                    {ticket.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-400">
                    {isSoldOut ? (
                      <span className="text-red-400 font-semibold">Sold Out</span>
                    ) : (
                      `${available} available`
                    )}
                  </span>
                  
                  {!isSoldOut && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-black/50 rounded-lg p-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleQuantityChange(ticket.id, -1)}
                          disabled={quantity === 0}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleQuantityChange(ticket.id, 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(ticket)}
                        disabled={quantity === 0}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
