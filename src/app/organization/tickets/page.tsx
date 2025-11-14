/**
 * Organization Tickets Page
 * Ticket management and scanning
 */

'use client';

import { Heading, Text } from '@/design-system';
import { AdminListTemplate } from '@/design-system';
import { Ticket, CheckCircle, QrCode } from 'lucide-react';
import { useAdminTickets } from '@/hooks/useAdminTickets';

export default function TicketsPage() {
  const { tickets, stats, loading, searchQuery, setSearchQuery } = useAdminTickets();

  return (
    <AdminListTemplate
      title="Ticket Management"
      description="View and manage event tickets"
      stats={[
        { label: 'Total Tickets', value: stats.total, icon: <Ticket /> },
        { label: 'Active', value: stats.active, icon: <CheckCircle /> },
        { label: 'Checked In', value: stats.checkedIn, icon: <QrCode /> },
      ]}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search tickets..."
      loading={loading}
      empty={{
        icon: <Ticket />,
        title: 'No tickets yet',
        description: 'Tickets will appear here when orders are placed',
      }}
    >
      {tickets && tickets.length > 0 && (
        <div>
          {tickets.map((ticket) => (
            <div key={ticket.id}>
              <Text>{ticket.qr_code}</Text>
            </div>
          ))}
        </div>
      )}
    </AdminListTemplate>
  );
}
