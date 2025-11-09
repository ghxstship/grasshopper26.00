/**
 * Dynamic Sitemap Generation
 * Automatically generates sitemap for SEO
 */

import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gvteway.com';
  const supabase = await createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/artists`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/membership`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ];

  // Dynamic event pages
  const { data: events } = await supabase
    .from('events')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('start_date', { ascending: false })
    .limit(100);

  const eventPages: MetadataRoute.Sitemap = events?.map((event) => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: new Date(event.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) || [];

  // Dynamic artist pages
  const { data: artists } = await supabase
    .from('artists')
    .select('slug, updated_at')
    .order('name', { ascending: true })
    .limit(100);

  const artistPages: MetadataRoute.Sitemap = artists?.map((artist) => ({
    url: `${baseUrl}/artists/${artist.slug}`,
    lastModified: artist.updated_at ? new Date(artist.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  })) || [];

  // Dynamic product pages
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(100);

  const productPages: MetadataRoute.Sitemap = products?.map((product) => ({
    url: `${baseUrl}/shop/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  })) || [];

  return [...staticPages, ...eventPages, ...artistPages, ...productPages];
}
