'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './SocialFeed.module.css';

export interface SocialPost {
  id: string;
  platform: 'instagram' | 'twitter' | 'facebook' | 'tiktok';
  imageUrl: string;
  caption?: string;
  likes?: number;
  comments?: number;
  url: string;
  timestamp: string;
}

export interface SocialFeedProps {
  /** Social media posts */
  posts: SocialPost[];
  /** Show load more button */
  showLoadMore?: boolean;
  /** Initial posts to display */
  initialPostsCount?: number;
  /** Posts to load per page */
  postsPerPage?: number;
  /** Load more handler */
  onLoadMore?: () => void;
  /** Additional CSS class */
  className?: string;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({
  posts,
  showLoadMore = false,
  initialPostsCount = 12,
  postsPerPage = 12,
  onLoadMore,
  className = '',
}) => {
  const [displayCount, setDisplayCount] = useState(initialPostsCount);

  const displayedPosts = showLoadMore ? posts.slice(0, displayCount) : posts;
  const hasMore = displayCount < posts.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + postsPerPage, posts.length));
    onLoadMore?.();
  };

  const getPlatformLabel = (platform: string) => {
    const labels = {
      instagram: 'IG',
      twitter: 'X',
      facebook: 'FB',
      tiktok: 'TT',
    };
    return labels[platform as keyof typeof labels] || platform.toUpperCase();
  };

  if (posts.length === 0) {
    return (
      <div className={`${styles.feed} ${className}`}>
        <div className={styles.empty}>
          <p className={styles.emptyText}>NO SOCIAL POSTS AVAILABLE</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.feed} ${className}`}>
      <div className={styles.grid}>
        {displayedPosts.map((post) => (
          <a
            key={post.id}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.post}
          >
            <Image
              src={post.imageUrl}
              alt={post.caption || 'Social media post'}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            <div className={styles.overlay}>
              <div className={styles.platform}>
                {getPlatformLabel(post.platform)}
              </div>
              {post.caption && (
                <p className={styles.caption}>{post.caption}</p>
              )}
              {(post.likes !== undefined || post.comments !== undefined) && (
                <div className={styles.stats}>
                  {post.likes !== undefined && (
                    <div className={styles.stat}>
                      <span>♥</span>
                      <span>{post.likes}</span>
                    </div>
                  )}
                  {post.comments !== undefined && (
                    <div className={styles.stat}>
                      <span>💬</span>
                      <span>{post.comments}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>

      {showLoadMore && hasMore && (
        <div className={styles.loadMore}>
          <button className={styles.loadMoreButton} onClick={handleLoadMore}>
            LOAD MORE
          </button>
        </div>
      )}
    </div>
  );
};

SocialFeed.displayName = 'SocialFeed';
