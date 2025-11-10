'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
import { SiteHeader } from '@/design-system/components/organisms/layout/site-header';
import { SiteFooter } from '@/design-system/components/organisms/layout/site-footer';
import { NewsCard } from '@/design-system/components/molecules/NewsCard/NewsCard';
import { Input } from '@/design-system/components/atoms/Input/Input';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image_url?: string;
  published_at: string;
  author?: string;
  category?: string;
}

export function NewsBrowseClient({ initialArticles, initialSearch }: { initialArticles: NewsArticle[]; initialSearch?: string }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');

  const filteredArticles = initialArticles
    .filter(article =>
      searchQuery ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
    );

  const mappedArticles = filteredArticles.map(article => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    imageUrl: article.image_url,
    date: new Date(article.published_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase(),
    author: article.author,
    category: article.category,
  }));

  return (
    <GridLayout
      header={<SiteHeader />}
      title="News & Updates"
      description="Stay informed with the latest from GVTEWAY"
      search={
        <Input
          type="search"
          placeholder="Search news..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      }
      columns={3}
      footer={<SiteFooter />}
    >
      {filteredArticles.map(article => (
        <NewsCard
          key={article.id}
          article={{
            id: article.id,
            title: article.title,
            excerpt: article.excerpt || '',
            imageUrl: article.image_url || '/placeholder.jpg',
            date: new Date(article.published_at).toLocaleDateString(),
            category: article.category,
            author: article.author,
          }}
          onClick={() => router.push(`/news/${article.slug}`)}
        />
      ))}
    </GridLayout>
  );
}
