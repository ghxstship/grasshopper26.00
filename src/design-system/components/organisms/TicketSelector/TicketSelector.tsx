/**
 * TicketSelector Component
 * GHXSTSHIP Entertainment Platform - Ticket Selection Interface
 * Multiple ticket types with quantity selection
 */

'use client';

import * as React from 'react';
import { TicketCard, TicketCardProps } from '../../molecules/TicketCard';
import { CTAButton } from '../../molecules/CTAButton';
import { PriceDisplay } from '../../molecules/PriceDisplay';
import styles from './TicketSelector.module.css';

export interface TicketSelectorProps {
  tickets: TicketCardProps['ticket'][];
  selectedTickets?: Record<string, number>;
  onTicketSelect?: (ticketId: string, quantity: number) => void;
  onCheckout?: () => void;
  currency?: string;
  className?: string;
}

export const TicketSelector = React.forwardRef<HTMLDivElement, TicketSelectorProps>(
  (
    {
      tickets,
      selectedTickets = {},
      onTicketSelect,
      onCheckout,
      currency = 'USD',
      className = '',
    },
    ref
  ) => {
    const calculateTotal = () => {
      return tickets.reduce((total, ticket) => {
        const quantity = selectedTickets[ticket.id] || 0;
        return total + (ticket.price * quantity);
      }, 0);
    };

    const getTotalQuantity = () => {
      return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    };

    const handleTicketClick = (ticketId: string) => {
      const currentQty = selectedTickets[ticketId] || 0;
      const newQty = currentQty === 0 ? 1 : 0;
      onTicketSelect?.(ticketId, newQty);
    };

    const classNames = [
      styles.container,
      className,
    ].filter(Boolean).join(' ');

    const total = calculateTotal();
    const totalQty = getTotalQuantity();

    return (
      <div ref={ref} className={classNames}>
        <div className={styles.header}>
          <h2 className={styles.title}>SELECT TICKETS</h2>
          {totalQty > 0 && (
            <div className={styles.selectedCount}>
              {totalQty} TICKET{totalQty !== 1 ? 'S' : ''} SELECTED
            </div>
          )}
        </div>

        <div className={styles.ticketGrid}>
          {tickets.map((ticket) => {
            const isSoldOut = ticket.available === 0;
            const isSelected = (selectedTickets[ticket.id] || 0) > 0;

            return (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                isSelected={isSelected}
                isSoldOut={isSoldOut}
                onSelect={() => handleTicketClick(ticket.id)}
              />
            );
          })}
        </div>

        {totalQty > 0 && (
          <div className={styles.summary}>
            <div className={styles.summaryContent}>
              <PriceDisplay
                price={total}
                currency={currency}
                label="TOTAL"
                size="lg"
                variant="highlighted"
              />
              
              <CTAButton
                variant="filled"
                size="lg"
                onClick={onCheckout}
                className={styles.checkoutButton}
              >
                CHECKOUT
              </CTAButton>
            </div>
          </div>
        )}
      </div>
    );
  }
);

TicketSelector.displayName = 'TicketSelector';
