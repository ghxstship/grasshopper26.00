'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GridLayout } from '@/design-system/components/templates/GridLayout/GridLayout';
import { NewsCard } from '@/design-system/components/molecules/NewsCard/NewsCard';
import { SearchBar } from '@/design-system/components/molecules/SearchBar/SearchBar';
import { Select } from '@/design-system/components/atoms/Select/Select';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Skeleton } from '@/design-system/components/atoms/Skeleton/Skeleton';
import { Pagination } from '@/design-system/components/molecules/Pagination/Pagination';

const ITEMS_PER_PAGE = 12;

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
  const [sortBy, setSortBy] = useState('date-desc');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort articles
  let filteredArticles = initialArticles.filter(article => {
    const matchesSearch = searchQuery
      ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return matchesSearch;
  });

  // Sort articles
  filteredArticles = [...filteredArticles].sort((a, b) => {
    const dateA = new Date(a.published_at).getTime();
    const dateB = new Date(b.published_at).getTime();
    
    switch (sortBy) {
      case 'date-desc':
        return dateB - dateA;
      case 'date-asc':
        return dateA - dateB;
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
  ];

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <GridLayout
      title="News"
      description="Stay informed with the latest updates"
      search={
        <SearchBar
          placeholder="Search news..."
          value={searchQuery}
          onChange={handleSearchChange}
          fullWidth
        />
      }
      sort={
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          selectSize="md"
        />
      }
      columns={3}
      pagination={
        totalPages > 1 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        ) : undefined
      }
    >
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="400px" />
        ))
      ) : paginatedArticles.length > 0 ? (
        paginatedArticles.map(article => (
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
        ))
      ) : (
        <Typography variant="h3" as="p" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-12)' }}>
          No articles found
        </Typography>
      )}
    </GridLayout>
  );
}
