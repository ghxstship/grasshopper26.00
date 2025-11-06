'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Wallet } from 'lucide-react';
import Image from 'next/image';
import { generateTicketQRCode } from '@/lib/tickets/qr-generator';

interface TicketDisplayProps {
  ticket: {
    id: string;
    qr_code: string;
    ticket_types: {
      name: string;
      price: string;
    };
    orders: {
      events: {
        name: string;
        start_date: string;
        venue_name: string;
        hero_image_url?: string;
      };
    };
  };
}

export function TicketDisplay({ ticket }: TicketDisplayProps) {
  const [qrCodeImage, setQrCodeImage] = useState<string>('');

  useEffect(() => {
    generateQR();
  }, [ticket.id]);

  async function generateQR() {
    const qr = await generateTicketQRCode(ticket.id);
    setQrCodeImage(qr);
  }

  const handleDownload = () => {
    // TODO: Generate and download PDF
    console.log('Download ticket PDF');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Ticket: ${ticket.orders.events.name}`,
        text: `My ticket for ${ticket.orders.events.name}`,
        url: window.location.href,
      });
    }
  };

  const handleAddToWallet = () => {
    // TODO: Add to Apple/Google Wallet
    console.log('Add to wallet');
  };

  return (
    <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 overflow-hidden">
      {ticket.orders.events.hero_image_url && (
        <div className="relative h-32 w-full">
          <Image
            src={ticket.orders.events.hero_image_url}
            alt={ticket.orders.events.name}
            fill
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        </div>
      )}
      
      <CardHeader>
        <h3 className="text-xl font-bold text-white">{ticket.orders.events.name}</h3>
        <p className="text-gray-400">
          {new Date(ticket.orders.events.start_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <p className="text-gray-400">{ticket.orders.events.venue_name}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Ticket Type</p>
          <p className="text-white font-semibold">{ticket.ticket_types.name}</p>
        </div>

        {qrCodeImage && (
          <div className="flex justify-center bg-white p-4 rounded-lg">
            <img src={qrCodeImage} alt="Ticket QR Code" className="w-48 h-48" />
          </div>
        )}

        <div className="text-center text-sm text-gray-400">
          <p>Ticket ID: {ticket.id.slice(0, 8).toUpperCase()}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="border-purple-500/30 hover:bg-purple-500/10"
          >
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="border-purple-500/30 hover:bg-purple-500/10"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddToWallet}
            className="border-purple-500/30 hover:bg-purple-500/10"
          >
            <Wallet className="h-4 w-4 mr-1" />
            Wallet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
