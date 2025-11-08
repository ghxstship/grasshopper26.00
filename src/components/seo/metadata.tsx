import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'event';
  publishedTime?: string;
  modifiedTime?: string;
}

export function generateSEO({
  title,
  description,
  image = '/og-image.jpg',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
}: SEOProps): Metadata {
  const siteName = process.env.NEXT_PUBLIC_BRAND_NAME || 'Grasshopper';
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://grasshopper.com';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return {
    title: `${title} | ${siteName}`,
    description,
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: type === 'event' ? 'website' : type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImage],
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

export function generateEventSchema(event: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.start_date,
    endDate: event.end_date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue_name,
      address: event.venue_address,
    },
    image: event.hero_image_url,
    offers: event.ticket_types?.map((ticket: any) => ({
      '@type': 'Offer',
      name: ticket.name,
      price: ticket.price,
      priceCurrency: 'USD',
      availability: ticket.quantity_available > ticket.quantity_sold 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/SoldOut',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.slug}`,
    })),
  };
}

export function generateArtistSchema(artist: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: artist.name,
    description: artist.bio,
    image: artist.profile_image_url,
    genre: artist.genre_tags,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/artists/${artist.slug}`,
    sameAs: Object.values(artist.social_links || {}).filter(Boolean),
  };
}
