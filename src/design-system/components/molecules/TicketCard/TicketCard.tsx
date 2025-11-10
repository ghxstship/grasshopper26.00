/**
 * TicketCard Component
 * GHXSTSHIP Entertainment Platform - Ticket Type Display
 * Bold geometric cards for ticket purchasing with thick borders
 */

import * as React from 'react';
import styles from './TicketCard.module.css';

export interface TicketCardProps {
  ticket: {
    id: string;
    name: string;
    price: number;
    currency?: string;
    description?: string;
    perks?: string[];
    available: number;
    maxPerOrder?: number;
  };
  onSelect?: () => void;
  isSelected?: boolean;
  isSoldOut?: boolean;
  className?: string;
}

export const TicketCard = React.forwardRef<HTMLDivElement, TicketCardProps>(
  ({ ticket, onSelect, isSelected = false, isSoldOut = false, className = '' }, ref) => {
    const classNames = [
      styles.card,
      isSelected && styles.selected,
      isSoldOut && styles.soldOut,
      onSelect && !isSoldOut && styles.clickable,
      className,
    ].filter(Boolean).join(' ');

    const handleClick = () => {
      if (onSelect && !isSoldOut) {
        onSelect();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (onSelect && !isSoldOut && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onSelect();
      }
    };

    const formatPrice = (price: number, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(price);
    };

    return (
      <div
        ref={ref}
        className={classNames}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={onSelect && !isSoldOut ? 'button' : undefined}
        tabIndex={onSelect && !isSoldOut ? 0 : undefined}
        aria-label={onSelect && !isSoldOut ? `Select ${ticket.name} ticket` : undefined}
        aria-disabled={isSoldOut}
      >
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.name}>{ticket.name}</h3>
          <div className={styles.price}>
            {formatPrice(ticket.price, ticket.currency)}
          </div>
        </div>

        {/* Description */}
        {ticket.description && (
          <p className={styles.description}>{ticket.description}</p>
        )}

        {/* Perks */}
        {ticket.perks && ticket.perks.length > 0 && (
          <ul className={styles.perksList}>
            {ticket.perks.map((perk, index) => (
              <li key={index} className={styles.perk}>
                <span className={styles.perkIcon} aria-hidden="true">▪</span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          {isSoldOut ? (
            <div className={styles.soldOutBadge}>
              <span className={styles.soldOutText}>SOLD OUT</span>
            </div>
          ) : (
            <>
              {ticket.available <= 10 && (
                <span className={styles.availability}>
                  {ticket.available} LEFT
                </span>
              )}
              {ticket.maxPerOrder && (
                <span className={styles.maxOrder}>
                  MAX {ticket.maxPerOrder} PER ORDER
                </span>
              )}
            </>
          )}
        </div>

        {/* Selection indicator */}
        {isSelected && !isSoldOut && (
          <div className={styles.selectedIndicator} aria-hidden="true">
            <span className={styles.checkmark}>✓</span>
          </div>
        )}
      </div>
    );
  }
);

TicketCard.displayName = 'TicketCard';
