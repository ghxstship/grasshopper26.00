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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="font-bebas text-h2 uppercase text-black mb-4">Event Not Found</h1>
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden border-b-3 border-black">
        {event.hero_image_url ? (
          <img
            src={event.hero_image_url}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-grey-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            onClick={toggleFavorite}
            variant="outline"
            size="icon"
            className="bg-white border-3 border-black hover:bg-grey-100"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-black text-black' : 'text-black'}`} />
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            size="icon"
            className="bg-white border-3 border-black hover:bg-grey-100"
          >
            <Share2 className="h-5 w-5 text-black" />
          </Button>
        </div>

        {/* Event Title */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-anton text-hero uppercase text-white mb-4">{event.name}</h1>
            <div className="flex flex-wrap gap-4 font-share text-base text-white">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{format(new Date(event.start_date), 'PPP')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{format(new Date(event.start_date), 'p')}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{event.venue_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card className="bg-white border-3 border-black">
              <CardContent className="p-6">
                <h2 className="font-bebas text-h2 uppercase text-black mb-4">About This Event</h2>
                <p className="whitespace-pre-wrap font-share text-body text-grey-700">{event.description}</p>
              </CardContent>
            </Card>

            {/* Venue Details */}
            <Card className="bg-white border-3 border-black">
              <CardContent className="p-6">
                <h2 className="font-bebas text-h2 uppercase text-black mb-4">Venue</h2>
                <div className="space-y-2">
                  <p className="font-bebas text-xl uppercase text-black">{event.venue_name}</p>
                  <p className="font-share text-base text-grey-600">{event.venue_address}</p>
                  {event.capacity && (
                    <div className="flex items-center gap-2 mt-4 font-share text-base text-grey-600">
                      <Users className="h-5 w-5" />
                      <span>Capacity: {event.capacity}</span>
                    </div>
                  )}
                  {event.age_restriction && (
                    <p className="font-share text-meta mt-2 text-grey-700">
                      Age Restriction: {event.age_restriction}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Artists */}
            {event.artists && event.artists.length > 0 && (
              <Card className="bg-white border-3 border-black">
                <CardContent className="p-6">
                  <h2 className="font-bebas text-h2 uppercase text-black mb-4">Lineup</h2>
                  <div className="space-y-4">
                    {event.artists.map((artist) => (
                      <div key={artist.id} className="flex gap-4">
                        {artist.image_url && (
                          <img
                            src={artist.image_url}
                            alt={artist.name}
                            className="w-20 h-20 border-3 border-black object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-bebas text-lg uppercase text-black">{artist.name}</h3>
                          <p className="font-share text-meta text-grey-600">{artist.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Tickets */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card className="bg-grey-100 border-3 border-black">
                <CardContent className="p-6">
                  <h2 className="font-bebas text-h2 uppercase text-black mb-6">Tickets</h2>
                  
                  {event.ticket_types.length === 0 ? (
                    <p className="text-center py-8 font-share text-base text-grey-600">
                      No tickets available at this time
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {event.ticket_types.map((ticketType) => {
                        const available = ticketType.quantity_available - ticketType.quantity_sold;
                        const isAvailable = available > 0 && ticketType.status === 'active';
                        
                        return (
                          <div
                            key={ticketType.id}
                            className="p-4 border-3 border-black bg-white"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-bebas text-lg uppercase text-black">{ticketType.name}</h3>
                                {ticketType.description && (
                                  <p className="font-share text-meta mt-1 text-grey-600">
                                    {ticketType.description}
                                  </p>
                                )}
                              </div>
                              <p className="font-bebas text-xl uppercase text-black">
                                ${parseFloat(ticketType.price).toFixed(2)}
                              </p>
                            </div>
                            
                            <p className="font-share text-meta mb-3 text-grey-500">
                              {available} available
                            </p>

                            {isAvailable ? (
                              <div className="flex items-center gap-2">
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
                                <span className="w-8 text-center font-bebas text-base text-black">
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
                              <p className="font-share text-meta text-grey-700">Sold Out</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {totalSelected > 0 && (
                    <div className="mt-6 pt-6 border-t-3 border-black">
                      <div className="flex justify-between mb-4 font-bebas text-lg uppercase text-black">
                        <span>Total ({totalSelected} tickets)</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                      <Button
                        onClick={handleAddToCart}
                        className="w-full"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
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
