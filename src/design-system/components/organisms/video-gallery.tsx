'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ExternalLink, Calendar, Eye } from 'lucide-react';
import { Button } from '@/design-system/components/atoms/button';
import { Dialog, DialogContent } from '@/design-system/components/atoms/dialog';
import { Badge } from '@/design-system/components/atoms/badge';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import styles from './video-gallery.module.css';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  viewCount: string;
  duration: string;
}

interface VideoGalleryProps {
  videos: Video[];
  title?: string;
  columns?: 2 | 3 | 4;
  showChannel?: boolean;
  className?: string;
}

export function VideoGallery({
  videos,
  title = 'Videos',
  columns = 3,
  showChannel = true,
  className,
}: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  const handleClose = () => {
    setIsPlayerOpen(false);
    setTimeout(() => setSelectedVideo(null), 300);
  };

  const gridColsClass = {
    2: styles.gridCols2,
    3: styles.gridCols3,
    4: styles.gridCols4,
  };

  const formatViews = (views: string) => {
    const num = parseInt(views);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className={`${styles.gallery} ${className || ''}`}>
      {title && <h2 className={styles.title}>{title}</h2>}

      <div className={`${styles.grid} ${gridColsClass[columns]}`}>
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={styles.videoCard}
            onClick={() => handleVideoClick(video)}
          >
            <div className={styles.videoThumbnail}>
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className={styles.thumbnailImage}
              />
              
              {/* Play Button Overlay */}
              <div className={styles.playOverlay}>
                <div className={styles.playButton}>
                  <Play className={styles.playIcon} />
                </div>
              </div>

              {/* Duration Badge */}
              {video.duration && (
                <Badge
                  variant="secondary"
                  className={styles.durationBadge}
                >
                  {video.duration}
                </Badge>
              )}
            </div>

            <div className={styles.videoInfo}>
              <h3 className={styles.videoTitle}>
                {video.title}
              </h3>
              
              {showChannel && (
                <p className={styles.channelName}>{video.channelTitle}</p>
              )}

              <div className={styles.videoMeta}>
                {video.viewCount && (
                  <span className={styles.metaItem}>
                    <Eye className={styles.metaIcon} />
                    {formatViews(video.viewCount)} views
                  </span>
                )}
                <span className={styles.metaItem}>
                  <Calendar className={styles.metaIcon} />
                  {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Player Modal */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className={styles.modalContent}>
          <AnimatePresence>
            {selectedVideo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.videoPlayer}>
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className={styles.iframe}
                  />
                </div>

                <div className={styles.modalInfo}>
                  <div className={styles.modalHeader}>
                    <div className={styles.modalDetails}>
                      <h2 className={styles.modalTitle}>{selectedVideo.title}</h2>
                      {showChannel && (
                        <p className={styles.modalChannel}>
                          {selectedVideo.channelTitle}
                        </p>
                      )}
                      <div className={styles.modalMeta}>
                        {selectedVideo.viewCount && (
                          <span className={styles.metaItem}>
                            <Eye className={styles.modalMetaIcon} />
                            {formatViews(selectedVideo.viewCount)} views
                          </span>
                        )}
                        <span>
                          {formatDistanceToNow(new Date(selectedVideo.publishedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <a
                        href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Watch on YouTube"
                      >
                        <ExternalLink className={styles.icon} />
                      </a>
                    </Button>
                  </div>

                  {selectedVideo.description && (
                    <div className={styles.descriptionSection}>
                      <p className={styles.description}>
                        {selectedVideo.description}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
