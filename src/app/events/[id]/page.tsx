'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Loader2, Calendar, MapPin, Clock, Users, Heart, Share2, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useCart } from '@/lib/store/cart-store';
import { toast } from 'sonner';
import styles from './page.module.css';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: string;
  quantity_available: number;
  quantity_sold: number;
  sale_start_date: string;
  sale_end_date: string;
  status: string;
}

interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  venue_name: string;
  venue_address: string;
  hero_image_url: string;
  capacity: number;
  age_restriction: string;
  status: string;
  ticket_types: TicketType[];
  artists: Array<{
    id: string;
    name: string;
    bio: string;
    image_url: string;
  }>;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const { addItem } = useCart();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadEvent();
    checkFavorite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types (*),
          event_artists (
            artists (
              id,
              name,
              bio,
              image_url
            )
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;

      // Transform the data structure
      const transformedEvent = {
        ...data,
        artists: data.event_artists?.map((ea: any) => ea.artists) || [],
      };

      setEvent(transformedEvent);
    } catch (error) {
      console.error('Error loading event:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', params.id)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      // Not a favorite
    }
  };

  const toggleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=' + encodeURIComponent(`/events/${params.id}`));
        return;
      }

      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', params.id);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            event_id: params.id,
            favoritable_type: 'event',
          });
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleQuantityChange = (ticketTypeId: string, quantity: number) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketTypeId]: Math.max(0, quantity),
    }));
  };

  const handleAddToCart = () => {
    if (!event) return;

    let addedCount = 0;
    Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
      if (quantity > 0) {
        const ticketType = event.ticket_types.find((tt) => tt.id === ticketTypeId);
        if (ticketType) {
          addItem({
            id: ticketTypeId,
            name: `${event.name} - ${ticketType.name}`,
            price: parseFloat(ticketType.price),
            quantity,
            type: 'ticket',
            ticketTypeId,
            eventId: event.id,
          });
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} ticket type(s) to cart`);
      router.push('/cart');
    } else {
      toast.error('Please select at least one ticket');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.name,
          text: event?.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingSpinner} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.errorContainer}>
        <div>
          <h1 className={styles.errorTitle}>Event Not Found</h1>
          <Button asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalSelected = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(selectedTickets).reduce((sum, [ticketTypeId, quantity]) => {
    const ticketType = event.ticket_types.find((tt) => tt.id === ticketTypeId);
    return sum + (ticketType ? parseFloat(ticketType.price) * quantity : 0);
  }, 0);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        {event.hero_image_url ? (
          <img
            src={event.hero_image_url}
            alt={event.name}
            className={styles.heroImage}
          />
        ) : (
          <div className={styles.heroImagePlaceholder} />
        )}
        <div className={styles.heroOverlay} />
        
        {/* Action Buttons */}
        <div className={styles.heroActions}>
          <Button
            onClick={toggleFavorite}
            variant="outline"
            size="icon"
            className={styles.actionButton}
          >
            <Heart className={isFavorite ? styles.heartIconFilled : styles.heartIcon} />
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            size="icon"
            className={styles.actionButton}
          >
            <Share2 className={styles.shareIcon} />
          </Button>
        </div>

        {/* Event Title */}
        <div className={styles.heroContent}>
          <div className={styles.content}>
            <h1 className={styles.heroTitle}>{event.name}</h1>
            <div className={styles.heroMeta}>
              <div className={styles.row}>
                <Calendar className={styles.icon} />
                <span>{format(new Date(event.start_date), 'PPP')}</span>
              </div>
              <div className={styles.row}>
                <Clock className={styles.icon} />
                <span>{format(new Date(event.start_date), 'p')}</span>
              </div>
              <div className={styles.row}>
                <MapPin className={styles.icon} />
                <span>{event.venue_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.mainContent}>
        <div className={styles.grid}>
          {/* Main Content */}
          <div className={styles.section}>
            {/* Description */}
            <Card className={styles.cardBg}>
              <CardContent className={styles.card}>
                <h2 className={styles.cardTitle}>About This Event</h2>
                <p className={styles.cardText}>{event.description}</p>
              </CardContent>
            </Card>

            {/* Venue Details */}
            <Card className={styles.cardBg}>
              <CardContent className={styles.card}>
                <h2 className={styles.cardTitle}>Venue</h2>
                <div className={styles.section}>
                  <p className={styles.venueName}>{event.venue_name}</p>
                  <p className={styles.venueAddress}>{event.venue_address}</p>
                  {event.capacity && (
                    <div className={styles.venueCapacity}>
                      <Users className={styles.icon} />
                      <span>Capacity: {event.capacity}</span>
                    </div>
                  )}
                  {event.age_restriction && (
                    <p className={styles.venueRestriction}>
                      Age Restriction: {event.age_restriction}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Artists */}
            {event.artists && event.artists.length > 0 && (
              <Card className={styles.cardBg}>
                <CardContent className={styles.card}>
                  <h2 className={styles.cardTitle}>Lineup</h2>
                  <div className={styles.section}>
                    {event.artists.map((artist) => (
                      <div key={artist.id} className={styles.artistCard}>
                        {artist.image_url && (
                          <img
                            src={artist.image_url}
                            alt={artist.name}
                            className={styles.artistImage}
                          />
                        )}
                        <div>
                          <h3 className={styles.artistName}>{artist.name}</h3>
                          <p className={styles.artistBio}>{artist.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Tickets */}
          <div className={styles.sidebar}>
            <div className={styles.stickyContainer}>
              <Card className={styles.cardBgGrey}>
                <CardContent className={styles.card}>
                  <h2 className={styles.cardTitle}>Tickets</h2>
                  
                  {event.ticket_types.length === 0 ? (
                    <p className={styles.emptyTickets}>
                      No tickets available at this time
                    </p>
                  ) : (
                    <div className={styles.section}>
                      {event.ticket_types.map((ticketType) => {
                        const available = ticketType.quantity_available - ticketType.quantity_sold;
                        const isAvailable = available > 0 && ticketType.status === 'active';
                        
                        return (
                          <div
                            key={ticketType.id}
                            className={styles.ticketCard}
                          >
                            <div className={styles.ticketHeader}>
                              <div>
                                <h3 className={styles.ticketName}>{ticketType.name}</h3>
                                {ticketType.description && (
                                  <p className={styles.ticketDescription}>
                                    {ticketType.description}
                                  </p>
                                )}
                              </div>
                              <p className={styles.ticketPrice}>
                                ${parseFloat(ticketType.price).toFixed(2)}
                              </p>
                            </div>
                            
                            <p className={styles.ticketAvailable}>
                              {available} available
                            </p>

                            {isAvailable ? (
                              <div className={styles.quantityControls}>
                                <Button
                                  onClick={() =>
                                    handleQuantityChange(
                                      ticketType.id,
                                      (selectedTickets[ticketType.id] || 0) - 1
                                    )
                                  }
                                  disabled={!selectedTickets[ticketType.id]}
                                  size="sm"
                                  variant="outline"
                                >
                                  -
                                </Button>
                                <span className={styles.quantityDisplay}>
                                  {selectedTickets[ticketType.id] || 0}
                                </span>
                                <Button
                                  onClick={() =>
                                    handleQuantityChange(
                                      ticketType.id,
                                      (selectedTickets[ticketType.id] || 0) + 1
                                    )
                                  }
                                  disabled={
                                    (selectedTickets[ticketType.id] || 0) >= available
                                  }
                                  size="sm"
                                  variant="outline"
                                >
                                  +
                                </Button>
                              </div>
                            ) : (
                              <p className={styles.soldOut}>Sold Out</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {totalSelected > 0 && (
                    <div className={styles.cartSummary}>
                      <div className={styles.cartTotal}>
                        <span>Total ({totalSelected} tickets)</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                      <Button
                        onClick={handleAddToCart}
                        className={styles.cartButton}
                      >
                        <ShoppingCart className={styles.cartIcon} />
                        Add to Cart
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
