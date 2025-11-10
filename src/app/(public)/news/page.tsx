import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { NewsBrowseClient } from './news-client';

export const metadata: Metadata = {
  title: 'News | GVTEWAY',
  description: 'Latest news and updates from GVTEWAY',
};

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const supabase = await createClient();
  const { search } = await searchParams;

  let query = supabase
    .from('news_articles')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data: articles } = await query;

  return <NewsBrowseClient initialArticles={articles || []} initialSearch={search} />;
}
