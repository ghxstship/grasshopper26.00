'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { Button } from '@/design-system/components/atoms/button';
import { Slider } from '@/design-system/components/atoms/slider';
import { Card } from '@/design-system/components/atoms/card';
import Image from 'next/image';
import styles from './music-player.module.css';

interface Track {
  id: string;
  name: string;
  preview_url: string | null;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  album: {
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
}

interface MusicPlayerProps {
  tracks: Track[];
  artistName: string;
  autoPlay?: boolean;
  className?: string;
}

export function MusicPlayer({ tracks, artistName, autoPlay = false, className }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks[currentTrackIndex];
  const hasPreview = currentTrack?.preview_url;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlay = () => {
    if (audioRef.current && hasPreview) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (autoPlay && hasPreview) {
      handlePlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, hasPreview]);

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setCurrentTime(0);
      if (isPlaying) {
        setTimeout(handlePlay, 100);
      }
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setCurrentTime(0);
      if (isPlaying) {
        setTimeout(handlePlay, 100);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleEnded = () => {
    if (currentTrackIndex < tracks.length - 1) {
      handleNext();
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <Card className={`${styles.player} ${className || ''}`}>
        <p className={styles.noTracksMessage}>No tracks available</p>
      </Card>
    );
  }

  const albumImage = currentTrack.album.images[0]?.url;
  const duration = currentTrack.duration_ms / 1000;

  return (
    <Card className={`${styles.player} ${className || ''}`}>
      <div className={styles.content}>
        {/* Album Art & Track Info */}
        <div className={styles.trackInfo}>
          {albumImage && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={currentTrack.id}
              className={styles.albumArt}
            >
              <Image
                src={albumImage}
                alt={currentTrack.album.name}
                fill
                className={styles.albumImage}
              />
            </motion.div>
          )}
          <div className={styles.trackDetails}>
            <h3 className={styles.trackName}>{currentTrack.name}</h3>
            <p className={styles.artistName}>{artistName}</p>
            <p className={styles.albumName}>{currentTrack.album.name}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <a
              href={currentTrack.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in Spotify"
            >
              <ExternalLink className={styles.icon} />
            </a>
          </Button>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressSection}>
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleSeek}
            disabled={!hasPreview}
            className={styles.progressSlider}
          />
          <div className={styles.timeDisplay}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.mainControls}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              disabled={currentTrackIndex === 0}
            >
              <SkipBack className={styles.icon} />
            </Button>
            
            {hasPreview ? (
              <Button
                variant="default"
                size="icon"
                onClick={isPlaying ? handlePause : handlePlay}
                className={styles.playButton}
              >
                {isPlaying ? (
                  <Pause className={styles.playIcon} />
                ) : (
                  <Play className={styles.playIcon} />
                )}
              </Button>
            ) : (
              <Button
                variant="default"
                size="icon"
                disabled
                className={styles.playButton}
                title="Preview not available"
              >
                <Play className={styles.playIcon} />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={currentTrackIndex === tracks.length - 1}
            >
              <SkipForward className={styles.icon} />
            </Button>
          </div>

          {/* Volume Control */}
          <div className={styles.volumeControl}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX className={styles.icon} />
              ) : (
                <Volume2 className={styles.icon} />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={(value) => {
                setVolume(value[0]);
                setIsMuted(false);
              }}
              className={styles.volumeSlider}
            />
          </div>
        </div>

        {/* Track List */}
        {tracks.length > 1 && (
          <div className={styles.trackList}>
            <p className={styles.trackListTitle}>Top Tracks</p>
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => {
                  setCurrentTrackIndex(index);
                  setCurrentTime(0);
                  if (isPlaying) {
                    setTimeout(handlePlay, 100);
                  }
                }}
                className={`${styles.trackItem} ${
                  index === currentTrackIndex ? styles.trackItemActive : ''
                }`}
              >
                <div className={styles.trackItemContent}>
                  <span className={styles.trackNumber}>{index + 1}</span>
                  <span className={styles.trackItemName}>{track.name}</span>
                  {!track.preview_url && (
                    <span className={styles.noPreviewBadge}>No preview</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {!hasPreview && (
          <p className={styles.noPreviewMessage}>
            Preview not available. Listen on Spotify →
          </p>
        )}
      </div>

      {/* Audio Element */}
      {hasPreview && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio
          ref={audioRef}
          src={currentTrack.preview_url || ''}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          preload="metadata"
          aria-label={`Now playing: ${currentTrack.name}`}
        />
      )}
    </Card>
  );
}
