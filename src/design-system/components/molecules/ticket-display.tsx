'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Download, Share2, Wallet } from 'lucide-react';
import Image from 'next/image';
import { generateTicketQRCode } from '@/lib/tickets/qr-generator';
import styles from './ticket-display.module.css';

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

  const generateQR = useCallback(async () => {
    try {
      const qr = await generateTicketQRCode(ticket.id);
      setQrCodeImage(qr);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }, [ticket.id]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

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
    <Card className={styles.card}>
      {ticket.orders.events.hero_image_url && (
        <div className={styles.heroImage}>
          <Image
            src={ticket.orders.events.hero_image_url}
            alt={ticket.orders.events.name}
            fill
            className={styles.heroImageInner}
          />
          <div className={styles.heroGradient} />
        </div>
      )}
      
      <CardHeader>
        <h3 className={styles.title}>{ticket.orders.events.name}</h3>
        <p className={styles.subtitle}>
          {new Date(ticket.orders.events.start_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <p className={styles.subtitle}>{ticket.orders.events.venue_name}</p>
      </CardHeader>

      <CardContent className={styles.content}>
        <div className={styles.ticketInfo}>
          <p className={styles.ticketInfoLabel}>Ticket Type</p>
          <p className={styles.ticketInfoValue}>{ticket.ticket_types.name}</p>
        </div>

        {qrCodeImage && (
          <div className={styles.qrContainer}>
            <Image 
              src={qrCodeImage} 
              alt="Ticket QR Code"
              width={200}
              height={200}
              className={styles.qrImage}
            />
          </div>
        )}

        <div className={styles.ticketId}>
          <p>Ticket ID: {ticket.id.slice(0, 8).toUpperCase()}</p>
        </div>

        <div className={styles.actions}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className={styles.actionButton}
          >
            <Download className={styles.actionIcon} />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className={styles.actionButton}
          >
            <Share2 className={styles.actionIcon} />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddToWallet}
            className={styles.actionButton}
          >
            <Wallet className={styles.actionIcon} />
            Wallet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
