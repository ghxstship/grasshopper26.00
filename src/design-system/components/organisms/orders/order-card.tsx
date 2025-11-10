/**
 * Order Card - Design System Compliant
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Calendar, DollarSign, Download } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import styles from './order-card.module.css';

interface OrderCardProps {
  order: {
    id: string;
    created_at: string;
    status: string;
    total_amount: string;
    tickets?: Array<{
      ticket_type?: Array<{
        event?: Array<{
          name: string;
          start_date: string;
        }>;
      }>;
    }>;
  };
}

export function OrderCard({ order }: OrderCardProps) {
  const firstTicket = order.tickets?.[0];
  const event = firstTicket?.ticket_type?.[0]?.event?.[0];

  return (
    <Card className={styles.card}>
      <CardHeader className={styles.header}>
        <div className={styles.headerContent}>
          <CardTitle className={styles.title}>
            Order #{order.id.slice(0, 8).toUpperCase()}
          </CardTitle>
          <span className={`${styles.statusBadge} ${styles[`status${order.status}`]}`}>
            {order.status.toUpperCase()}
          </span>
        </div>
        <p className={styles.date}>
          {format(new Date(order.created_at), 'PPP')}
        </p>
      </CardHeader>
      <CardContent className={styles.content}>
        {event && (
          <div className={styles.eventInfo}>
            <Calendar className={styles.icon} />
            <div>
              <p className={styles.eventName}>{event.name}</p>
              <p className={styles.eventDate}>
                {format(new Date(event.start_date), 'PPP')}
              </p>
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.totalAmount}>
            <DollarSign className={styles.icon} />
            <span className={styles.amount}>
              ${parseFloat(order.total_amount).toFixed(2)}
            </span>
          </div>
          <div className={styles.actions}>
            <Button asChild variant="outline" size="sm">
              <Link href={`/orders/${order.id}`}>View Details</Link>
            </Button>
            {order.status === 'completed' && order.tickets && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/orders/${order.id}/tickets`}>
                  <Download className={styles.buttonIcon} />
                  Tickets
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
