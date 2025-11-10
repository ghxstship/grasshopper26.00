import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { NewsDetailClient } from './news-detail-client';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase.from('news_articles').select('title, excerpt').eq('slug', slug).single();
  
  return {
    title: article ? `${article.title} | GVTEWAY` : 'News | GVTEWAY',
    description: article?.excerpt || 'News article',
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: article } = await supabase
    .from('news_articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!article) notFound();

  return <NewsDetailClient article={article} />;
}
