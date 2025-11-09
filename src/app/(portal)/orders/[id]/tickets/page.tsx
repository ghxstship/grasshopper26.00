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
      <div className="min-h-screen flex items-center justify-center " style={{ background: 'var(--gradient-hero)' }}>
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!order || order.tickets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center " style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Tickets Found</h1>
          <Button asChild>
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-12 px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="max-w-4xl mx-auto">
        <Button
          asChild
          variant="ghost"
          className="mb-6 text-gray-400 hover:text-white"
        >
          <Link href={`/orders/${order.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Tickets</h1>
          <p className="text-gray-400">
            Download your tickets or save the QR codes to your device
          </p>
        </div>

        <div className="mb-6">
          <Button
            onClick={handleDownloadAll}
            disabled={downloading}
            className="w-full " style={{ background: 'var(--gradient-brand-primary)' }}
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download All Tickets as PDF
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {order.tickets.map((ticket, index) => {
            const ticketType = ticket.ticket_type[0];
            const event = ticketType?.event[0];

            return (
              <Card
                key={ticket.id}
                className="bg-black/40 backdrop-blur-lg border-purple-500/20"
              >
                <CardHeader>
                  <CardTitle className="text-white">
                    Ticket {index + 1} of {order.tickets.length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {event?.name || 'Event'}
                        </h3>
                        <p className="text-purple-400">{ticketType?.name || 'Ticket'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Venue</p>
                        <p className="text-white">{event?.venue_name || 'TBD'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Date</p>
                        <p className="text-white">
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
                        <p className="text-sm text-gray-400">Ticket ID</p>
                        <p className="text-white font-mono text-sm">
                          {ticket.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-white p-4 rounded-lg mb-4">
                        <QRCodeSVG
                          value={ticket.qr_code}
                          size={200}
                          level="H"
                          includeMargin
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <QrCodeIcon className="h-4 w-4" />
                        <span>Scan at entrance</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 p-6 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Important Information</h3>
          <ul className="space-y-2 text-sm text-gray-300">
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
