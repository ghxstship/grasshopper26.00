'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './MusicPlayer.module.css';

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  artworkUrl?: string;
}

export interface MusicPlayerProps {
  /** Tracks to play */
  tracks: Track[];
  /** Initial track index */
  initialTrackIndex?: number;
  /** Show playlist */
  showPlaylist?: boolean;
  /** Additional CSS class */
  className?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  tracks,
  initialTrackIndex = 0,
  showPlaylist = true,
  className = '',
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(initialTrackIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, tracks.length]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playPrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(1, percent)));
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && isPlaying) {
      audio.play();
    }
  }, [currentTrackIndex]);

  return (
    <div className={`${styles.player} ${className}`}>
      <audio ref={audioRef} src={currentTrack.audioUrl}>
        <track kind="captions" />
      </audio>

      <div className={styles.trackInfo}>
        {currentTrack.artworkUrl && (
          <div className={styles.artwork}>
            <Image
              src={currentTrack.artworkUrl}
              alt={currentTrack.title}
              width={96}
              height={96}
              className={styles.artworkImage}
            />
          </div>
        )}
        <div className={styles.details}>
          <h3 className={styles.trackTitle}>{currentTrack.title}</h3>
          <p className={styles.artistName}>{currentTrack.artist}</p>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.controlButton}
          onClick={playPrevious}
          disabled={currentTrackIndex === 0}
          aria-label="Previous track"
        >
          ⏮
        </button>
        <button
          className={`${styles.controlButton} ${styles.play}`}
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button
          className={styles.controlButton}
          onClick={playNext}
          disabled={currentTrackIndex === tracks.length - 1}
          aria-label="Next track"
        >
          ⏭
        </button>

        <div className={styles.progress}>
          <div className={styles.progressBar} onClick={handleProgressClick} onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleProgressClick(e as any);
            }
          }} role="button" tabIndex={0}>
            <div
              className={styles.progressFill}
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className={styles.progressTime}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className={styles.volume}>
        <button
          className={styles.volumeButton}
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <div className={styles.volumeSlider} onClick={handleVolumeClick} onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleVolumeClick(e as any);
          }
        }} role="button" tabIndex={0}>
          <div
            className={styles.volumeFill}
            style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
          />
        </div>
      </div>

      {showPlaylist && tracks.length > 1 && (
        <div className={styles.playlist}>
          <h4 className={styles.playlistTitle}>PLAYLIST</h4>
          <div className={styles.playlistItems}>
            {tracks.map((track, index) => (
              <button
                key={track.id}
                className={`${styles.playlistItem} ${
                  index === currentTrackIndex ? styles.active : ''
                }`}
                onClick={() => selectTrack(index)}
              >
                <div className={styles.playlistItemInfo}>
                  <div className={styles.playlistItemTitle}>{track.title}</div>
                  <div className={styles.playlistItemDuration}>
                    {formatTime(track.duration)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

MusicPlayer.displayName = 'MusicPlayer';
