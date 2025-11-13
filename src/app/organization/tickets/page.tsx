/**
 * Organization Tickets Page
 * Ticket management and scanning
 */

'use client';

import { AdminListTemplate } from '@/design-system/components/templates/AdminListTemplate/AdminListTemplate';
import { AdminSidebar } from '@/design-system/components/organisms/AdminSidebar/AdminSidebar';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Ticket, CheckCircle, QrCode } from 'lucide-react';
import { useAdminTickets } from '@/hooks/useAdminTickets';

export default function TicketsPage() {
  const { tickets, stats, loading, searchQuery, setSearchQuery } = useAdminTickets();

  return (
    <AdminListTemplate
      sidebar={<AdminSidebar />}
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
              <Typography variant="body">{ticket.qr_code}</Typography>
            </div>
          ))}
        </div>
      )}
    </AdminListTemplate>
  );
}
