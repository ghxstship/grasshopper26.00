import { Card, Text, Button } from '../../atoms';
import styles from './TicketSelector.module.css';
export function TicketSelector({ 
  tickets = [], 
  onSelect, 
  onTicketSelect,
  selectedTickets,
  onCheckout 
}: { 
  tickets?: any[]; 
  onSelect?: (ticket: any) => void;
  onTicketSelect?: (ticket: any) => void;
  selectedTickets?: Record<string, number>;
  onCheckout?: () => void;
}) {
  const handleSelect = onSelect || onTicketSelect;
  return (
    <Card>
      <Text>Ticket Selector - {tickets.length} tickets</Text>
      {tickets.map(ticket => (
        <div key={ticket.id} className={styles.ticketItem}>
          <Text weight="medium">{ticket.name}</Text>
          <Text size="sm">${ticket.price}</Text>
          {handleSelect && <Button size="sm" onClick={() => handleSelect(ticket)}>Select</Button>}
        </div>
      ))}
      {onCheckout && <Button onClick={onCheckout} className={styles.checkoutButton}>Checkout</Button>}
    </Card>
  );
}
