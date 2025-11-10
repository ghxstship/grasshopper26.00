'use client';

import { useState } from 'react';
import { PublicBrowseTemplate } from '@/design-system/components/templates';
import { Newspaper } from 'lucide-react';
import { NewsCard } from '@/design-system/components/organisms/news/news-card';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image_url?: string;
  published_at: string;
}

export function NewsBrowseClient({ initialArticles, initialSearch }: { initialArticles: NewsArticle[]; initialSearch?: string }) {
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState('date-desc');

  const filteredArticles = initialArticles
    .filter(article =>
      searchQuery ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
    )
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      if (sortBy === 'date-asc') return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
      return 0;
    });

  return (
    <PublicBrowseTemplate
      title="NEWS & UPDATES"
      subtitle="Stay informed with the latest from GVTEWAY"
      heroGradient={true}
      searchPlaceholder="Search news..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      showSearch={true}
      sortOptions={[
        { value: 'date-desc', label: 'Newest First' },
        { value: 'date-asc', label: 'Oldest First' },
      ]}
      sortValue={sortBy}
      onSortChange={setSortBy}
      items={filteredArticles}
      renderItem={(article) => <NewsCard article={article} />}
      gridColumns={3}
      gap="lg"
      showResultsCount={true}
      totalCount={initialArticles.length}
      emptyState={{
        icon: <Newspaper />,
        title: "No articles found",
        description: "Check back soon for updates",
      }}
    />
  );
}
