'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Loader2, ArrowLeft, Download, QrCode as QrCodeIcon } from 'lucide-react';
import { generateMultipleTicketsPDF, downloadPDF } from '@/lib/tickets/pdf-generator';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import styles from './page.module.css';

interface Ticket {
  id: string;
  qr_code: string;
  status: string;
  ticket_type: Array<{
    name: string;
    price: string;
    event: Array<{
      name: string;
      start_date: string;
      venue_name: string;
      venue_address: string;
    }>;
  }>;
}

interface Order {
  id: string;
  tickets: Ticket[];
  user_id: string;
}

export default function TicketDownloadPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/orders');
        return;
      }

      setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Guest');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          tickets (
            id,
            qr_code,
            status,
            ticket_type:ticket_types (
              name,
              price,
              event:events (
                name,
                start_date,
                venue_name,
                venue_address
              )
            )
          )
        `)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setOrder(data as any);
    } catch (error) {
      console.error('Error loading tickets:', error);
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!order) return;

    setDownloading(true);
    try {
      const ticketsData = order.tickets.map((ticket) => {
        const ticketType = ticket.ticket_type[0];
        const event = ticketType?.event[0];

        return {
          id: ticket.id,
          eventName: event?.name || 'Event',
          eventDate: event?.start_date || new Date().toISOString(),
          venue: `${event?.venue_name || 'Venue'}\n${event?.venue_address || ''}`,
          ticketType: ticketType?.name || 'General Admission',
          attendeeName: userName,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          qrCode: ticket.qr_code,
          price: parseFloat(ticketType?.price || '0'),
        };
      });

      const pdfBlob = await generateMultipleTicketsPDF(ticketsData);
      downloadPDF(pdfBlob, `tickets-${order.id.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate tickets. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${styles.row} ${styles.heroGradient}`}>
        <Loader2 className={styles.spinner} />
      </div>
    );
  }

  if (!order || order.tickets.length === 0) {
    return (
      <div className={`${styles.row} ${styles.heroGradient}`}>
        <div >
          <h1 className={styles.title}>No Tickets Found</h1>
          <Button asChild>
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles.heroGradient}`}>
      <div className={styles.content}>
        <Button
          asChild
          variant="ghost"
          className={styles.text}
        >
          <Link href={`/orders/${order.id}`}>
            <ArrowLeft className={styles.icon} />
            Back to Order
          </Link>
        </Button>

        <div className={styles.section}>
          <h1 className={styles.title}>Your Tickets</h1>
          <p >
            Download your tickets or save the QR codes to your device
          </p>
        </div>

        <div className={styles.section}>
          <Button
            onClick={handleDownloadAll}
            disabled={downloading}
            className={`${styles.fullWidth} ${styles.brandGradient}`}
          >
            {downloading ? (
              <>
                <Loader2 className={styles.spinner} />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className={styles.icon} />
                Download All Tickets as PDF
              </>
            )}
          </Button>
        </div>

        <div className={styles.section}>
          {order.tickets.map((ticket, index) => {
            const ticketType = ticket.ticket_type[0];
            const event = ticketType?.event[0];

            return (
              <Card
                key={ticket.id}
                
              >
                <CardHeader>
                  <CardTitle >
                    Ticket {index + 1} of {order.tickets.length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.grid}>
                    <div className={styles.section}>
                      <div>
                        <h3 className={styles.text}>
                          {event?.name || 'Event'}
                        </h3>
                        <p className={styles.text}>{ticketType?.name || 'Ticket'}</p>
                      </div>
                      <div>
                        <p className={styles.subtitle}>Venue</p>
                        <p >{event?.venue_name || 'TBD'}</p>
                      </div>
                      <div>
                        <p className={styles.subtitle}>Date</p>
                        <p >
                          {event?.start_date
                            ? new Date(event.start_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'TBD'}
                        </p>
                      </div>
                      <div>
                        <p className={styles.subtitle}>Ticket ID</p>
                        <p className={styles.text}>
                          {ticket.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className={styles.row}>
                      <div className={styles.card}>
                        <QRCodeSVG
                          value={ticket.qr_code}
                          size={200}
                          level="H"
                          includeMargin
                        />
                      </div>
                      <div className={styles.row}>
                        <QrCodeIcon className={styles.icon} />
                        <span>Scan at entrance</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className={styles.card}>
          <h3 className={styles.text}>Important Information</h3>
          <ul className={styles.section}>
            <li>• Save these QR codes to your device or print them out</li>
            <li>• Present your ticket at the venue entrance for scanning</li>
            <li>• Each ticket can only be scanned once</li>
            <li>• Valid ID may be required at entrance</li>
            <li>• Tickets are non-transferable and non-refundable</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
